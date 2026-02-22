import { createServer } from "node:http";
import sirv from "sirv";
import { consola } from "consola";
import {
	resolveOptions,
	generateEnvObject,
	generateEnvJsPayload,
} from "../env-generator.js";

/**
 * Start the production server
 * @param {import('../types.ts').ProductionServerOptions} [options]
 * @returns {Promise<{ close(): Promise<void> }>}
 */
export async function startProductionServer(options) {
	/** @type {import('../types.ts').ResolvedProductionServerOptions} */
	const opts = resolveOptions(options);

	// Create static file handler with sirv
	const serveStatic = sirv(opts.distDir, {
		dev: false,
		etag: true,
		maxAge: 0,
		single: opts.spaFallback,
		setHeaders: (res) => {
			const contentType = res.getHeader("Content-Type") || "";

			// Set cache headers based on content type
			if (contentType.includes("text/html")) {
				res.setHeader("Cache-Control", opts.cacheControl.html);
			} else if (contentType.match(/\/(javascript|css|json|xml|text)/)) {
				res.setHeader("Cache-Control", opts.cacheControl.assets);
			} else {
				res.setHeader("Cache-Control", opts.cacheControl.other);
			}
		},
	});

	// Create HTTP server
	const server = createServer((req, res) => {
		// Apply security headers to all responses
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

		// Apply custom headers if provided
		if (opts.headers) {
			const customHeaders =
				typeof opts.headers === "function"
					? opts.headers(req.url || "/")
					: opts.headers;
			for (const [key, value] of Object.entries(customHeaders)) {
				res.setHeader(key, value);
			}
		}

		const url = req.url || "/";

		// Handle env.js endpoint
		if (url === opts.envJsPath) {
			handleEnvJs(req, res, opts);
			return;
		}

		// Handle config.json endpoint
		if (opts.configJsonPath && url === opts.configJsonPath) {
			handleConfigJson(req, res, opts);
			return;
		}

		// Handle static files (sirv handles SPA fallback and cache headers)
		serveStatic(req, res);
	});

	// Start listening
	await new Promise((resolve) => {
		server.listen(opts.port, opts.host, () => {
			if (opts.log) {
				consola.info(
					`Server listening on http://${opts.host}:${opts.port}`,
				);
			}
			resolve(undefined);
		});

		server.on("error", (err) => {
			throw err;
		});
	});

	return {
		close: () => {
			return new Promise((resolve, reject) => {
				server.close((err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		},
	};
}

/**
 * Handle env.js request
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {import('../types.ts').ResolvedProductionServerOptions} opts
 */
function handleEnvJs(req, res, opts) {
	// Generate env object from process.env
	const env = generateEnvObject(process.env, opts);

	const payload = generateEnvJsPayload(env, opts.globalName);

	res.setHeader("Content-Type", "application/javascript; charset=utf-8");
	res.setHeader("Cache-Control", "no-cache, no-store");
	res.setHeader("Pragme", "no-cache");

	res.end(payload);
}

/**
 * Handle config.json request
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {import('../types.ts').ResolvedProductionServerOptions} opts
 */
function handleConfigJson(req, res, opts) {
	// Generate env object from process.env
	const env = generateEnvObject(process.env, opts);

	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.setHeader("Cache-Control", "no-cache, no-store");
	res.setHeader("Pragme", "no-cache");

	res.end(JSON.stringify(env, null, 2));
}
