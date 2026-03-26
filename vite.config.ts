import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import path from "path";

export default defineConfig(({ mode }) => {
  if (mode === "worker") {
    return {
      build: {
        lib: {
          entry: "src/worker/index.ts",
          formats: ["es"],
          fileName: "index",
        },
        outDir: "dist/worker",
        emptyOutDir: true,
        rollupOptions: {
          external: ["__STATIC_CONTENT_MANIFEST"],
        },
      },
      resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
      },
    };
  }

  return {
    plugins: [
      react(),
      devServer({
        entry: "src/worker/index.ts",
        injectClientScript: false,
      }),
    ],
    build: {
      outDir: "dist/client",
      emptyOutDir: true,
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});
