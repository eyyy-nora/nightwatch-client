# Nightwatch

You don't need to sleep on the streets! Find shelters near you!

## Development

This package uses pnpm. To install pnpm use:
```shell
npm i -g pnpm
```

Installing dependencies:
```shell
pnpm i
```

Start the local database:
```shell
docker compose up -d
```

Running the development server:
```shell
pnpm run server:dev
```

Building the server-side code:
```shell
pnpm run server:build
```

Running the server:
```shell
pnpm run server:start
```


Running the electron app:
```shell
pnpm run client:dev
```

Building the electron app:
```shell
pnpm run client:build
```

## Project Structure

- /src: Houses the source code of all parts of the application
  - /main: Houses the electron main thread and logic
  - /renderer: Houses the electron browser context
    - /component: general use components that can be used in any app
      - /layout: Layout components with little logic or imposed design
      - /map: Map components (leaflet)
      - /page: Styled and opinionated components for composing a page
      - /typography: Text-Based components, like icons, titles, headings, labels, etc.
    - /context: react contexts
    - /fragment: reusable parts of the ui that are application specific
    - /store: stores and data operations
      - /simple-store: simplified universal and flexible store with no artificially imposed limits
    - /util: client side utilities
    - /view: single use parts of the ui that are not intended to be repurposed
  - /service: Server/API Code
  - /entity: TypeORM entities, also importable in client side code
  - /transformer: TypeORM value transformers
  - /types: Typings applicable for server and client side
  - /util: Shared utilities for both server and client side
- /icons: Icons to use within the renderer code, will be automatically injected.
- /resources: Static assets

## Tooling

This project uses eslint as a linter. To see formatting issues, use `eslint --ext .ts,.tsx`.
Linting information will also be output in the build process. To edit linter rules, edit both the
`.eslintrc` file as well as the `.prettierrc` file in the project root

The server side code is bundled with tsup, a typescript wrapper for esbuild. To configure tsup, edit
the `tsup.config.ts` file in the project root.

The electron code is bundled by electron-esbuild, which can be configured with the `electron-esbuild.config.yaml`
and the `esbuild.main.config.ts` file.

The browser build uses vite, which uses esbuild under the hood. Vite can be configured with the `vite.config.ts`
inside the `src/renderer` directory. similarly tailwind and postcss can be configured in their respective
configurations also located at `src/renderer`.

environment variables can be configured in two locations. server-side and electron-side env variables can be set
in `.env` in the project root or by creating a `.env.local` file for local environment settings
(make sure to exclude this from git).
all the browser context side environment variables need to be configured at `src/renderer/.env` or its `.env.local`
equivalent. only variables prefixed with `VITE_` will be available in runtime code.

## Conventions

- Naming
  - Directory and Filenames: kebap-case, or dash-case with lower-case file extensions
  - Classes, Types, Generics and Decorators: PascalCase should be used. Only the first letter of acronyms should be capitalised. example: HttpResponse
  - Every other value: camelCase should be used.

- File Encoding: utf-8 should be used for all text based files and unix style line endings should be used
- Tabs / Spaces: two spaces should be used for indentation

## Versioning

All branch names should be exclusively in kebap-case and should fork from master.
Feature branches should be prefixed with feature/, bug fix branches should be prefixed with fix/

Commits should follow the Conventional Commits guidelines:
https://www.conventionalcommits.org/en/v1.0.0/


### Bootstrapped with @electron-esbuild/create-app


