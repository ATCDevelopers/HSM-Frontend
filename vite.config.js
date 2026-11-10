import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backend the dev server forwards /api to. Override with API_PROXY_TARGET=http://host:port npm run dev.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:8000";

// Only VITE_-prefixed variables reach the browser, via import.meta.env.
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Hostnames allowed to reach the dev server through a tunnel. A leading dot allows every subdomain,
    // which matters for Cloudflare quick tunnels: they get a new random name each time they start.
    allowedHosts: [".trycloudflare.com"],
    // Same-origin API: the browser calls /api/v1/... on whatever host serves the app (localhost or a tunnel)
    // and Vite forwards it to the backend, so no second tunnel or CORS setup is needed.
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
});
