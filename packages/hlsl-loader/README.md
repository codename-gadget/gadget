> HLSL for WebGL 2.0, including offline program introspection and Typescript support.

## Motivations

Writing GLSL for WebGL is notoriously unfriendly from a dev's perspective. Without some kind of preprocessor like [glslx](https://github.com/evanw/glslx), there's no proper editor integration, no offline compilation or optimisation, and, worst of all, no support for importing files.

Instead of trying to go the fully custom route like [glslx](https://github.com/evanw/glslx), this loader offloads the majority of work to HLSL, a well-established, well-supported languange and only provides the means to easily incorporate it into an existing WebGL project.

## Main goals

- Converting HLSL to GLES 3.0 for use in WebGL 2.0
- Supporting multiple entry points per HLSL file
- Providing static introspection data, including UBO buffer layouts, vertex attributes and textures.

## Usage

Install the loader

```text
yarn add --dev @gdgt/hlsl-loader
```

```text
npm i -D @gdgt/hlsl-loader
```

and add it to your webpack config:

```javascript
export default {
  // ...
  module: {
    rules: {
      test: /\.hlsl$/i,
      loader: "@gdgt/hlsl-loader",
      options: {
        // ...
      },
    },
  },
};
```

If your config is written in Typescript, you can also grab the options type:

```typescript
import type { HlslLoaderOptions } from "@gdgt/hlsl-loader";

export default {
  // ...
  module: {
    rules: {
      // ...
      options: {
        // ...
      } as HlslLoaderOptions,
    },
  },
};
```

By default `@gdgt/hlsl-loader` will look for two functions ("entry points") per HLSL file:

- `vsMain` will be treated as the vertex shader entry. Its GLES 3.0 source is exported as `vertexShader`
- `psMain` will be treated as the fragment shader entry. Its GLES 3.0 source is exported as `fragmentShader`

## Example

```HLSL
// shader.hlsl

struct VSInput {
  [[vk::location(0)]] float3 position : POSITION;
};

struct VSOutput {
  float4 position : SV_POSITION;
};

VSOutput vsMain(VSInput vsIn) {
  VSOutput vsOut = (VSOutput)0;
  vsOut.position = float4(vsIn.position, 1.0f);

  return vsOut;
}

float4 psMain(VSOutput vsOut) : SV_TARGET {
  return float4(1.0f, 0.0f, 1.0f, 1.0f);
}
```

Importing the above file will give you:

```typescript
import {
  // GLES 3.0 source of vsMain
  vertexShader,

  // GLES 3.0 source of psMain
  fragmentShader,

  // info about UBOs, attributes and textures being used
  introspection,
} from "./shader.hlsl";

// With 'introspection' looking like this:
{
    ubos: {},
    textures: {},
    attributes: {
        _a0: {
            type: 35665, // numeric value of gl.FLOAT_VEC3
            location: 0
        },
    },
}
```

## Loader options

| Option                 | Default             | Description                                                                                                                   |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `exports`              | See [Usage](#usage) | A list of exports and entry points to check per HLSL file. See [Multiple entrypoints](#multiple-entrypoints) for more detail. |
| `mangle`               | `true`              | Whether to shorten internal variable names.                                                                                   |
| `includeDirectories`   | `[]`                | Directories to search for `#include`d files in addition to the directory containing the imported file.                        |
| `logGlsl`              | `false`             | Whether to log the compiled GLSL code to the console.<br />May be useful during development, disabled for production builds.  |
| `generateDeclarations` | `true`              | Whether to emit `.d.ts` files containing declarations for imported HLSL files.<br />Disabled for production builds.           |

## How it works

The inital HLSL file is run through the [DirectX Shader Compiler (dxc)](https://github.com/microsoft/DirectXShaderCompiler), converting it to a [SPIR-V](https://www.khronos.org/spir/) binary per entrypoint. Subsequently, [spriv-cross](https://github.com/KhronosGroup/SPIRV-Cross)s reflection functionality is used to gather information on each program. Finally, the [SPIR-V](https://www.khronos.org/spir/) binaries are converted to GLES 3.0 via [spriv-cross](https://github.com/KhronosGroup/SPIRV-Cross), renaming some interface variables to ensure compatibility. Introspection info from all entry-points is merged and exported as JSON.

## Limitations

- Only UBOs are supported at the moment. Plain uniform arrays will be ignored, with the only exception being sampler objects. As long as you stick to `cbuffer`s in HLSL, you should never encounter this limitation.
- Currently, uniforms and attributes are limited to the following types: `float`, `int` and `bool`, including their vector types, and `float4x4` matrices. This list is likely to be expanded in the future.
- Textures and sampler states need to be specifically marked to not produce weird output. See [Textures and SamplerState](#textures-and-samplerstate).
- Sampler state is not represented in the introspection object and needs to be carried across manually.
- Certain symbol names can lead to unexpected behaviour. It's best to avoid any names starting with `gl_` or `_` in general.
- UBOs are forced to `std140` layout.
- All entry points of a file are assumed to be for the same program, which is why there's only one introspection object. Bundling multiple programs per file will lead to incorrect introspection data and undefined behaviour.
- Interface variables are matched internally by location, meaning that they may be out of whack when imported from different files, even if the names match. To ensure compatibility, you should manually specify the location using the `[[vk::location(n)]]` attribute, or only combine shaders imported from the same file.

For a `dxc` specifc list of limitations, see `dxc`s [SPIR-V docs](https://github.com/Microsoft/DirectXShaderCompiler/blob/master/docs/SPIR-V.rst).

## Tips

### Specifying the location of vertex attributes

Buffer attribute indices/locations can be explicitly specified using the `[[vk::location(n)]]` attribute. This is carried over to the exported introspection object.

```hlsl
struct VSInput {
  [[vk::location(0)]] float3 position : POSITION;
  [[vk::location(2)]] float2 uv : TEXCOORD0;
};
```

### Textures and SamplerState

HLSL ordinarily does not support combined Texture-Sampler objects the way GLES 3.0 expects them.
To work around this, we flag both Texture and SamplerState using the `[[vk::combinedImageSampler]]` attribute and bind them to the same unit using `[[vk::binding(1)]]`.

This results in GLES 3.0 program expecting a uniform named `g_MyTexture` of type `sampler2D`. The binding is carried over to the exported introspection object.

```hlsl
[[vk::combinedImageSampler]] [[vk::binding(1)]] Texture2D g_MyTexture;
[[vk::combinedImageSampler]] [[vk::binding(1)]] SamplerState MyTextureSampler;

float4 main() : SV_TARGET {
  // sample as usual
  return g_MyTexture.Sample(MyTextureSampler, float2(0.0f));
}
```

See the [`dxc` SPIR-V docs](https://github.com/Microsoft/DirectXShaderCompiler/blob/master/docs/SPIR-V.rst#vulkan-specific-attributes) for a complete list of supported attributes.

### Multiple entrypoints

By default, `@gdgt/hlsl-loader` will attempt to extract two entry points per HLSL file:

- `vsMain` for the vertex stage, exported as `vertexShader`
- `psMain` for the pixel stage, exported as `fragmentShader`

You can change this by adding an `exports` object to the loaders config:

```typescript
{
    exports: {
        myVertexExportName: {
            name: 'myHLSLVertexFunctionName',
            stage: 'vs_6_7',
        },
        myFragmentExportName: {
            name: 'myHLSLFragmentFunctionName',
            stage: 'ps_6_7',
        }
    }
}
```

`stage` specifies the shader model and -stage to compile to, `vs` and `ps` meaning "vertex shader" and "pixel shader" respectively, and `6_7` being the shader model version.

If you want to keep your main functions named the same across stages, you can also use [dxcs predefined version macros](https://github.com/microsoft/DirectXShaderCompiler/wiki/Predefined-Version-Macros) to conditionally include them.

## Todos

- End to end tests
- Support for matrix types other than `float4x4`

## Notice / Attribution

This loader builds on and ships binaries of the following projects:

- The [DirectX Shader Compiler](https://github.com/Microsoft/DirectXShaderCompiler) from Microsoft, distributed under NCSA.
- [SPIRV-Cross](https://github.com/KhronosGroup/SPIRV-Cross) from Khronos, distributed under Apache 2.0.

See [NOTICE](./NOTICE) for more info.

## License

`@gdgt/hlsl-loader` is distributed under the terms of the Apache 2.0 License. See [LICENSE](./LICENSE) for more info.
