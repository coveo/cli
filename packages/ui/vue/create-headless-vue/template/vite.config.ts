import { fileURLToPath, URL } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import coveoPlugin from "./src/server";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

const rootDir = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [coveoPlugin(loadEnv("", rootDir)), vue(), vueJsx()],
  resolve: {
    alias: {
      "@": resolve(rootDir, "./src/ui"),
      commons: resolve(rootDir, "./src/commons"),
    },
  },
});
