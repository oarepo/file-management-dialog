import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteMockServe } from "vite-plugin-mock";
// import fs from "fs/promises";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      viteMockServe({
        mockPath: "mock",
        enable: true,
        localEnabled: command === "serve",
        prodEnabled: command !== "serve" && mode === "production",
        injectCode: `
        import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();
      `,
      }),
    ],
    // esbuild: {
    //   loader: "jsx",
    //   include: /src\/.*\.js[x]?$/,
    //   exclude: [],
    // },
    // optimizeDeps: {
    //   esbuildOptions: {
    //     loader: {
    //       ".js": "jsx"
    //     },
    //     plugins: [
    //       {
    //         name: "load-js-files-as-jsx",
    //         setup(build) {
    //           build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
    //             loader: "jsx",
    //             contents: await fs.readFile(args.path, "utf8"),
    //           }));
    //         },
    //       },
    //     ],
    //   },
    // },
  };
});
