import { BuildOptions } from "esbuild";
import { resolve } from "path";
import eslint from "esbuild-plugin-eslint";
import { readFileSync } from "fs";
// import { devDependencies } from "./package.json" assert { type: "json" };
const { devDependencies } = JSON.parse(readFileSync("./package.json", "utf-8"));

const config: BuildOptions = {
  platform: "node",
  entryPoints: [resolve("src/main/main.ts"), resolve("src/main/preload.ts")],
  plugins: [eslint()],
  bundle: true,
  target: "node16.15.0", // electron version target
  external: Object.keys(devDependencies),
};

export default config;
