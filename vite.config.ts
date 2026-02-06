import {defineConfig, type PluginOption} from "vite";
import inferno from "./config/vite/plugin-inferno-swc/dist/index.js";
import path from "path";

export default defineConfig(({command}) => {
  const isBuild = command === "build";

  return {
    plugins: inferno({
      jsxFactory: "Inferno.createElement",
      jsxFragment: "Inferno.Fragment"
    }) as unknown as PluginOption[],
    resolve: {
      alias: [{
        find: /^inferno$/,
        replacement: isBuild ? "inferno/dist/index.mjs" : "inferno/dist/index.dev.mjs"
      }, {
        find: "src",
        replacement: path.resolve(__dirname, "./src")
      }]
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(isBuild ? "production" : "development")
    },
    build: {
      target: "es2022",
      cssTarget: "chrome107"
    },
    server: {
      port: 5110,
      allowedHosts: true
    },
    base: isBuild ? "/GTFO/" : "/",
  };
});