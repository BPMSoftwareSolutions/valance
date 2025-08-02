import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin for runtime TypeScript transformation
    {
      name: "runtime-plugin-loader",
      configureServer(server) {
        server.middlewares.use("/plugins", async (req, res, next) => {
          if (req.url?.endsWith(".ts") || req.url?.endsWith(".tsx")) {
            try {
              const fs = await import("fs/promises");
              const path = await import("path");
              const { transformSync } = await import("esbuild");

              // Construct file path - plugins are in public/plugins
              const filePath = path.join(
                process.cwd(),
                "public",
                "plugins",
                req.url
              );
              console.log(`🔄 Transforming plugin: ${req.url} -> ${filePath}`);

              const content = await fs.readFile(filePath, "utf-8");

              const result = transformSync(content, {
                loader: req.url.endsWith(".tsx") ? "tsx" : "ts",
                format: "esm",
                target: "es2020",
                jsx: "automatic",
                jsxImportSource: "react",
              });

              res.setHeader("Content-Type", "application/javascript");
              res.end(result.code);
              return;
            } catch (error) {
              console.error("❌ Plugin transformation error:", error);
              res.statusCode = 500;
              res.end(`// Plugin transformation failed: ${error.message}`);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    // Configure middleware to serve plugin files correctly
    middlewareMode: false,
    fs: {
      // Allow serving files from the plugins directory
      allow: ["..", "public/plugins", "public/json-components"],
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Ensure static assets are served correctly
  publicDir: "public",
  // Configure how SPA fallback works
  appType: "spa",
});
