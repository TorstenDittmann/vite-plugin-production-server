import { defineConfig } from "docia";

export default defineConfig({
	title: "vite-plugin-production-server",
	description:
		"Vite plugin + production server for runtime-configurable environment variables",
	baseUrl: "https://vite-plugin-production-server.vercel.app",
	srcDir: "book",
	outDir: "./book-dist",
});
