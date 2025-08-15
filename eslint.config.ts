import { defineConfig } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
	{
		ignores: ["**/*.config.js", "package.json"],
		plugins: {
			js,
		},
		extends: ["js/recommended"],
	},
]);