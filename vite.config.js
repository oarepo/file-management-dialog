import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteMockServe from "vite-plugin-mock";

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
  };
});
