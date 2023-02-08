import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => {
  return {
    entry: ["src/service/main.ts"],
    sourcemap: true,
    onSuccess: watch ? "pnpm run server:start" : undefined,
    clean: true,
    minify: !watch,
    format: ["cjs"],
    target: "node16",
    outDir: "dist/service",
  };
});
