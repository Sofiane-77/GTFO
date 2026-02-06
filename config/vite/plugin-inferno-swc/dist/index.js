import { createRequire } from "node:module";
import { join } from "node:path";
import { transform } from "@swc/core";

//#region src/index.ts
const JSX_RUNTIME_ID = "\0vite:inferno-swc:jsx-runtime";
const JSX_DEV_RUNTIME_ID = "\0vite:inferno-swc:jsx-dev-runtime";
const RUNTIME_SOURCE = `import { createElement } from 'inferno-create-element'
import { Fragment } from 'inferno'

const toKeyString = (key) => (key == null ? null : '' + key)

const assignKey = (props, key) => {
  const keyValue = toKeyString(key)
  if (keyValue == null) {
    return props ?? null
  }
  if (!props || typeof props !== 'object') {
    return { key: keyValue }
  }
  if (props.key === keyValue) {
    return props
  }
  return { ...props, key: keyValue }
}

const normalizeProps = (props, key) => assignKey(props, key)

const jsx = (type, props, key) => createElement(type, normalizeProps(props, key))
const jsxs = jsx

export { Fragment, jsx, jsxs }
`;
const DEV_RUNTIME_SOURCE = `import { createElement } from 'inferno-create-element'
import { Fragment } from 'inferno'

const toKeyString = (key) => (key == null ? null : '' + key)

const assignKey = (props, key) => {
  const keyValue = toKeyString(key)
  if (keyValue == null) {
    return props ?? null
  }
  if (!props || typeof props !== 'object') {
    return { key: keyValue }
  }
  if (props.key === keyValue) {
    return props
  }
  return { ...props, key: keyValue }
}

const withDevProps = (props, key, source, self) => {
  const assigned = assignKey(props, key)
  if (source === undefined && self === undefined) {
    return assigned
  }
  const clone = assigned ? { ...assigned } : {}
  if (source !== undefined) clone.__source = source
  if (self !== undefined) clone.__self = self
  return clone
}

const jsx = (type, props, key) => createElement(type, assignKey(props, key))
const jsxs = jsx
const jsxDEV = (type, props, key, _isStaticChildren, source, self) =>
  createElement(type, withDevProps(props, key, source, self))

export { Fragment, jsx, jsxs, jsxDEV }
`;
const inferno = (_options) => {
	const resolve = createRequire(typeof __filename !== "undefined" ? __filename : import.meta.url).resolve;
	const normalized = {
		runtime: _options?.runtime ?? "automatic",
		importSource: _options?.importSource ?? "inferno",
		jsxFactory: _options?.jsxFactory ?? "createElement",
		jsxFragment: _options?.jsxFragment ?? "Fragment",
		tsDecorators: _options?.tsDecorators ?? false,
		devTarget: _options?.devTarget ?? "es2020",
		buildTarget: _options?.buildTarget,
		parserConfig: _options?.parserConfig,
		plugins: _options?.plugins?.map((entry) => [resolve(entry[0]), entry[1]]),
		useDefineForClassFields: _options?.useDefineForClassFields ?? true,
		useAtYourOwnRisk_mutateSwcOptions: _options?.useAtYourOwnRisk_mutateSwcOptions
	};
	let viteCacheRoot;
	let resolvedBuildTarget = normalized.buildTarget;
	let command = "serve";
	const runtimePlugins = [];
	if (normalized.runtime === "automatic") {
		const runtimeImport = `${normalized.importSource}/jsx-runtime`;
		const runtimeDevImport = `${normalized.importSource}/jsx-dev-runtime`;
		runtimePlugins.push({
			name: "vite:inferno-swc:runtime",
			enforce: "pre",
			resolveId(id) {
				if (id === runtimeImport) return JSX_RUNTIME_ID;
				if (id === runtimeDevImport) return JSX_DEV_RUNTIME_ID;
			},
			load(id) {
				if (id === JSX_RUNTIME_ID) return RUNTIME_SOURCE;
				if (id === JSX_DEV_RUNTIME_ID) return DEV_RUNTIME_SOURCE;
			}
		});
	}
	const mainPlugin = {
		name: "vite:inferno-swc",
		enforce: "pre",
		config(config) {
			enhanceUserConfig(config, normalized);
		},
		configResolved(resolved) {
			viteCacheRoot = resolved.cacheDir;
			command = resolved.command;
			if (!resolvedBuildTarget) resolvedBuildTarget = pickBuildTarget(resolved);
		},
		async transform(code, id, transformOptions) {
			if (id.startsWith("\0")) return null;
			const filename = id.split("?")[0];
			const isServer = !!transformOptions?.ssr;
			const isDev = command !== "build" && !isServer;
			const target = command === "build" || isServer ? resolvedBuildTarget ?? "esnext" : normalized.devTarget;
			const jsxConfig = createJsxConfig(normalized, isDev);
			const result = await transformWithOptions(filename, code, target, normalized, viteCacheRoot, jsxConfig);
			if (!result) return null;
			return {
				code: result.code,
				map: result.map
			};
		}
	};
	return [...runtimePlugins, mainPlugin];
};
const createJsxConfig = (options, development) => {
	if (options.runtime === "classic") return {
		runtime: "classic",
		pragma: options.jsxFactory,
		pragmaFrag: options.jsxFragment,
		development,
		throwIfNamespace: false
	};
	return {
		runtime: "automatic",
		importSource: options.importSource,
		development
	};
};
const pickBuildTarget = (config) => {
	const buildTarget = config.build.target;
	const value = Array.isArray(buildTarget) ? buildTarget[0] : buildTarget;
	if (!value) return "esnext";
	if (value === "modules") return "es2020";
	return value;
};
const enhanceUserConfig = (config, options) => {
	config.esbuild ??= {};
	if (config.esbuild.jsx == null) config.esbuild.jsx = "preserve";
	if (options.runtime === "classic") {
		if (config.esbuild.jsxFactory == null) config.esbuild.jsxFactory = options.jsxFactory;
		if (config.esbuild.jsxFragment == null) config.esbuild.jsxFragment = options.jsxFragment;
	} else if (config.esbuild.jsxImportSource == null) config.esbuild.jsxImportSource = options.importSource;
	config.optimizeDeps ??= {};
	const include = config.optimizeDeps.include ||= [];
	for (const dep of ["inferno", "inferno-create-element"]) if (!include.includes(dep)) include.push(dep);
	const esbuildOptions = config.optimizeDeps.esbuildOptions ??= {};
	if (options.runtime === "classic") {
		esbuildOptions.jsx ??= "classic";
		esbuildOptions.jsxFactory ??= options.jsxFactory;
		esbuildOptions.jsxFragment ??= options.jsxFragment;
	} else {
		esbuildOptions.jsx ??= "automatic";
		esbuildOptions.jsxImportSource ??= options.importSource;
	}
};
const transformWithOptions = async (id, code, target, options, viteCacheRoot, jsx) => {
	const decorators = options.tsDecorators;
	const parser = options.parserConfig ? options.parserConfig(id) : id.endsWith(".tsx") ? {
		syntax: "typescript",
		tsx: true,
		decorators
	} : id.endsWith(".ts") || id.endsWith(".mts") ? {
		syntax: "typescript",
		tsx: false,
		decorators
	} : id.endsWith(".jsx") || id.endsWith(".js") || id.endsWith(".mjs") ? {
		syntax: "ecmascript",
		jsx: true
	} : void 0;
	if (!parser) return;
	let result;
	try {
		const swcOptions = {
			filename: id,
			swcrc: false,
			configFile: false,
			sourceMaps: true,
			jsc: {
				target,
				parser,
				experimental: {
					plugins: options.plugins,
					cacheRoot: join(viteCacheRoot ?? "node_modules/.vite", ".swc")
				},
				transform: {
					useDefineForClassFields: options.useDefineForClassFields,
					react: jsx
				}
			}
		};
		if (options.useAtYourOwnRisk_mutateSwcOptions) options.useAtYourOwnRisk_mutateSwcOptions(swcOptions);
		result = await transform(code, swcOptions);
	} catch (e) {
		const err = e;
		const message = err?.message;
		if (typeof message === "string") {
			const match = message.match(/:(\d+):(\d+)\]/);
			if (match) {
				err.line = match[1];
				err.column = match[2];
			}
		}
		throw e;
	}
	return result;
};
var src_default = inferno;
function pluginForCjs(options) {
	return inferno.call(this, options);
}
Object.assign(pluginForCjs, { default: pluginForCjs });

//#endregion
export { src_default as default, pluginForCjs as "module.exports" };