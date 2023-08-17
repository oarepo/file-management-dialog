import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import preact from "@preact/preset-vite";
import { viteMockServe } from "vite-plugin-mock";
// import fs from "fs/promises";

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
    plugins: [
      react(),
      viteMockServe({
        mockPath: "mock",
        enable: true,
        logger: true,
        watchFiles: true,
        localEnabled: command === "serve",
        prodEnabled: command !== "serve" && mode === "production",
        injectCode: `
        import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();
      `,
      }),
    ],
    worker: {
      format: "es",
    },
    // esbuild: {
    //   loader: "jsx",
    //   include: /src\/.*\.js[x]?$/,
    //   exclude: [],
    // },
    optimizeDeps: {
      include: [
        "classnames",
      ],
      // esbuildOptions: {
      //   loader: {
      //     ".js": "jsx"
      //   },
      //   plugins: [
      //     {
      //       name: "load-js-files-as-jsx",
      //       setup(build) {
      //         build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
      //           loader: "jsx",
      //           contents: await fs.readFile(args.path, "utf8"),
      //         }));
      //       },
      //     },
      //   ],
      // },
    },
  };
});
