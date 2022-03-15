# gadget monorepo

> Home of all public packages related to gadget

## Requirements

- nvm ([Linux/macOS](https://github.com/nvm-sh/nvm), [Windows](https://github.com/coreybutler/nvm-windows))
- [yarn 1.x](https://classic.yarnpkg.com/lang/en/)
- lerna (`yarn global add lerna`)
- An editor with ESLint support

# Getting started

Before editing any individual packages, we first need to set up the monorepo.
From the root dir:

1. Switch to the correct node version by running

   ```
   nvm use
   ```

2. Install dependencies

   ```
   yarn
   ```

3. Link all packages together

   ```
   lerna bootstrap
   ```
