import { readFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateFonts } from "@fukumong/fantasticon";
import { fantasticon } from "vite-plugin-fantasticon";
import tsconfigPaths from "vite-tsconfig-paths";
// import { devDependencies } from "../package.json" assert { type: "json" };
const { devDependencies } = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    fantasticon({
      name: "icons",
      inputDir: "icons",
      pathOptions: { ts: "./src/renderer/icons.ts" },
      generateFonts,
    }),
    tsconfigPaths({ loose: true }),
    react(),
  ],
  build: {
    target: "chrome108", // electron version target
    rollupOptions: {
      external: Object.keys(devDependencies),
    },
  },
  server: {
    hmr: true,
    watch: { usePolling: true },
    port: 9080,
  },
});
