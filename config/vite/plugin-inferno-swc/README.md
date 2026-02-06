# vite-plugin-inferno-swc

Vite plugin that wires [Inferno](https://infernojs.org/) to the SWC-based JSX/TSX pipeline. It keeps the dev server fast while emitting Inferno friendly VNodes with zero Babel involved.

- ⚡️ Uses SWC for TypeScript & modern syntax transforms
- 🧠 Provides a minimal automatic JSX runtime backed by `inferno-create-element`
- 🔧 Supports `automatic` and `classic` runtime modes with configurable factories

## Installation

```sh
npm i -D vite-plugin-inferno-swc inferno inferno-create-element
```

## Usage

```ts
import { defineConfig } from 'vite'
import inferno from 'vite-plugin-inferno-swc'

export default defineConfig({
  plugins: [inferno()],
})
```

## Options

All options are optional and mirror SWC capabilities.

### runtime

Switch between the automatic JSX runtime (default) and the classic pragma based runtime.

```ts
inferno({ runtime: 'classic' })
```

### importSource

Where JSX helpers are imported from when `runtime` is `automatic`.

`@default` `"inferno"`

```ts
inferno({ importSource: '@my/custom-runtime' })
```

### jsxFactory / jsxFragment

Factory identifiers used in classic runtime mode.

```ts
inferno({ runtime: 'classic', jsxFactory: 'createVNode', jsxFragment: 'Fragment' })
```

### tsDecorators

Enable SWC support for TypeScript legacy decorators.

```ts
inferno({ tsDecorators: true })
```

### devTarget / buildTarget

Override the emitted JavaScript target for development or build time.

```ts
inferno({ devTarget: 'es2022', buildTarget: 'es2018' })
```

### parserConfig

Provide a factory that returns a custom SWC parser configuration per file.

```ts
inferno({
  parserConfig(id) {
    if (id.endsWith('.mdx')) return { syntax: 'ecmascript', jsx: true }
  },
})
```

### plugins

Register SWC native plugins.

```ts
inferno({ plugins: [['@swc/plugin-styled-components', {}]] })
```

### useDefineForClassFields

Toggle `useDefineForClassFields`. Enabled by default to match the ECMAScript spec.

```ts
inferno({ useDefineForClassFields: false })
```

### useAtYourOwnRisk_mutateSwcOptions

Last-resort escape hatch to mutate the final SWC options object before compilation.

```ts
inferno({
  useAtYourOwnRisk_mutateSwcOptions(options) {
    options.jsc.keepClassNames = true
  },
})
```

## Notes

- `inferno` and `inferno-create-element` are declared as peer dependencies; keep them installed in your project.
- The plugin ships with a tiny JSX runtime that maps SWC's automatic runtime output to Inferno's `createElement`.
- Fast refresh for Inferno is not included; rely on Vite's default HMR handling or custom solutions.
