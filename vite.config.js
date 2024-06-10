import { resolve } from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { name } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      preact(),
      cssInjectedByJsPlugin(),
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
