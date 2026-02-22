import { defineConfig } from "docia";

export default defineConfig({
	srcDir: "book",
	outDir: "./book-dist",
	basePath: "/vite-plugin-production-server/",
	prettyUrls: true,
	site: {
		title: "vite-plugin-production-server",
		description:
			"Vite plugin + production server for runtime-configurable environment variables",
		language: "en",
		url: "https://torstendittmann.github.io/vite-plugin-production-server",
		socials: {
			github: "https://github.com/TorstenDittmann/vite-plugin-production-server",
			x: "https://x.com/dittmanntorsten",
		},
		githubEditBaseUrl:
			"https://github.com/TorstenDittmann/vite-plugin-production-server/edit/main/book",
	},
});
