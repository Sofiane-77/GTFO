import { JscTarget, Options, ParserConfig } from "@swc/core";
import { Plugin } from "vite";

//#region src/index.d.ts
type JsxRuntime = "automatic" | "classic";
type PluginDefinition = [string, Record<string, unknown>];
type Options$1 = {
  runtime?: JsxRuntime;
  importSource?: string;
  jsxFactory?: string;
  jsxFragment?: string;
  tsDecorators?: boolean;
  devTarget?: JscTarget;
  buildTarget?: JscTarget;
  parserConfig?: (id: string) => ParserConfig | undefined;
  plugins?: PluginDefinition[];
  useDefineForClassFields?: boolean;
  useAtYourOwnRisk_mutateSwcOptions?: (options: Options) => void;
};
declare const inferno: (_options?: Options$1) => Plugin[];
declare function pluginForCjs(this: unknown, options: Options$1): Plugin[];
//#endregion
export { inferno as default, pluginForCjs as "module.exports" };