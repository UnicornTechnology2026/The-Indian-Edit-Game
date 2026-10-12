import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "node:fs";
import { defineConfig, loadEnv } from "vite";

function copyStaticDirsPlugin() {
  return {
    name: "copy-static-dirs",
    closeBundle() {
      const dirs = ["assets", "decode-the-bottle", "master-the-blend"];
      for (const dir of dirs) {
        const src = path.resolve(__dirname, dir);
        const dest = path.resolve(__dirname, "dist", dir);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      }
    },
  };
}

// Local dev only: runs the files in /api like Vercel does.
function localApi() {
  return {
    name: "local-api",
    configureServer(server: any) {
      // load .env / .env.local so the API files can read the secrets
      Object.assign(
        process.env,
        loadEnv(server.config.mode, process.cwd(), ""),
      );

      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/api/")) return next();
        const name = req.url.split("?")[0].replace("/api/", "");
        if (!name || name.startsWith("_")) return next();

        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);

          let raw = "";
          for await (const chunk of req) raw += chunk;
          req.body = raw ? JSON.parse(raw) : {};

          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: unknown) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          };

          await mod.default(req, res);
        } catch (e) {
          console.error("local api error:", e);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "API error" }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), copyStaticDirsPlugin(), localApi()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
