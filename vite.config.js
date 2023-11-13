import { resolve } from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
// import babel from 'vite-plugin-babel';
// import { viteMockServe } from "vite-plugin-mock";
import { name } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      preact(),
      // babel({
      //   filter: /\.js$/,
      //   apply: 'build',
      //   babelConfig: {
      //     babelrc: false,
      //     configFile: false,
      //     presets: [
      //       ['@babel/preset-env', {
      //         modules: false
      //       }],
      //       // ['@babel/preset-react', { pragma: 'h', pragmaFrag: 'Fragment' }],
      //     ],
      //     plugins: [
      //       "@babel/plugin-proposal-nullish-coalescing-operator",
      //       "@babel/plugin-proposal-logical-assignment-operators"
      //     ],
      //   }
      // }),
      cssInjectedByJsPlugin(),
      // Enable only when not using storybook as it already has a mock server
      // viteMockServe({
      //   mockPath: "mock",
      //   enable: true,
      //   logger: true,
      //   watchFiles: true,
      //   localEnabled: command === "serve",
      //   prodEnabled: command !== "serve" && mode === "production",
      //   injectCode: `
      //   import { setupProdMockServer } from './mockProdServer';
      //   setupProdMockServer();
      //   `,
      // }),
    ],
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
    build: {
      target: "es2019",
      copyPublicDir: false, // public/mockServiceWorker.js is only for storybook
      lib: {
        entry: resolve(__dirname, "src/index.js"),
        name,
        formats: ["es", "umd"],
        fileName: (format) => `file-manager.${format}.js`,
      },
      rollupOptions: {
        external: ["preact"],
        output: {
          globals: {
            preact: "preact"
          },
        },
      },
    },
    worker: {
      format: "es"
    },
  };
});
