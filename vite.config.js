import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { viteMockServe } from "vite-plugin-mock";
import { name } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    resolve: {
      alias: {
        "react": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat", // Must be below test-utils
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.js"),
        name,
        formats: ["es", "umd"],
        fileName: (format) => `${name}.${format}.js`,
      },
    },
    plugins: [
      react(),
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
      // `,
      // }),
    ],
    worker: {
      format: "es",
    },
  };
});
