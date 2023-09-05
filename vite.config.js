import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
// import { viteMockServe } from "vite-plugin-mock";
import { name } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
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
    resolve: {
      alias: {
        "react": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat", // Must be below test-utils
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
    build: {
      copyPublicDir: false, // public/mockServiceWorker.js is only for storybook
      lib: {
        entry: resolve(__dirname, "src/index.js"),
        name,
        formats: ["es", "umd"],
        fileName: (format) => `file-manager.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM"
          },
        },
      },
    },
    worker: {
      format: "es"
    },
  };
});
