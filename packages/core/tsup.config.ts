import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2020",
  entry: [
    "src/index.ts", 
    "src/presets/index.ts",
    "src/components/index.ts",
  ],
  format: ["cjs", "esm"],
  clean: true,
  dts: {
    compilerOptions: {
      module: "NodeNext",
      moduleResolution: "NodeNext"
    },
    resolve: true,
  },
});