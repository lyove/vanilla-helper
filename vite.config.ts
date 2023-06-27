import path from "path";
import { defineConfig } from "vite";
import banner from "vite-plugin-banner";
import packageJson from "./package.json";

// PackageName
const packageName = "helper";

const fileName = {
  es: `${packageName}.es.js`,
  umd: `${packageName}.umd.js`,
  iife: `${packageName}.iife.js`,
};

const pkgInfo = `/**
 * name: ${packageJson.name}
 * version: ${packageJson.version}
 * description: ${packageJson.description}
 * author: ${packageJson.author}
 * homepage: ${packageJson.homepage}
 * repository: ${packageJson.repository.url}
 */`;

module.exports = defineConfig({
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: packageName,
      formats: ["es", "umd", "iife"],
      fileName: (format) => fileName[format],
    },
  },
  plugins: [banner(pkgInfo)],
});
