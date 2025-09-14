import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const plugins = [react()];

  // Only add Replit plugins in development and when in Replit environment
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const [runtimeErrorOverlay, cartographer] = await Promise.all([
        import("@replit/vite-plugin-runtime-error-modal").then(m => m.default),
        import("@replit/vite-plugin-cartographer").then(m => m.cartographer())
      ]);
      plugins.push(runtimeErrorOverlay(), cartographer);
    } catch (error) {
      console.warn("Replit plugins not available:", error.message);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
