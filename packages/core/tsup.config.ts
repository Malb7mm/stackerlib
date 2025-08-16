import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2020",
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