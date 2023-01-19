import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import coveoPlugin from "./src/server";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [coveoPlugin(loadEnv("", process.cwd())), vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/ui", import.meta.url)),
      commons: fileURLToPath(new URL("./src/commons", import.meta.url)),
    },
  },
});
