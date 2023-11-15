import { resolve } from "node:path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { name } from "./package.json";
// import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      preact(),
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
