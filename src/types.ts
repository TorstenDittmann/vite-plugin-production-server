export interface ProductionServerPluginOptions {
  /**
   * Prefix to include env vars (default: 'VITE_')
   */
  envPrefix?: string | string[];

  /**
   * Route that returns JS assigning window.__ENV__ (default: '/env.js')
   */
  envJsPath?: string;

  /**
   * Route that returns JSON runtime config (optional, default: disabled)
   */
  configJsonPath?: string | null;

  /**
   * Inject script tag into index.html (default: true)
   */
  injectEnvScript?: boolean;

  /**
   * Where to inject: 'head-prepend' | 'head-append' (default: 'head-prepend')
   */
  injectPosition?: 'head-prepend' | 'head-append';

  /**
   * Customize which keys from process.env are exposed in production
   */
  expose?: (key: string, value: string | undefined) => boolean;

  /**
   * Defaults for MODE/BASE_URL when running prod server (default: MODE='production', BASE_URL='/')
   */
  defaults?: {
    mode?: string;
    baseUrl?: string;
  };

  /**
   * Whether to include Vite-like meta flags (DEV/PROD/SSR) (default: true)
   */
  includeMetaFlags?: boolean;

  /**
   * Enable dev middleware serving env.js (default: true)
   */
  devMiddleware?: boolean;

  /**
   * Name of global for injected env payload (default: '__ENV__')
   */
  globalName?: string;
}

export interface ProductionServerOptions {
  /**
   * Directory containing built files (default: 'dist')
   */
  distDir?: string;

  /**
   * Port to listen on (default: 4173)
   */
  port?: number;

  /**
   * Host to bind to (default: '0.0.0.0')
   */
  host?: string;

  /**
   * Base URL path (default: '/')
   */
  base?: string;

  /**
   * Enable SPA fallback to index.html (default: true)
   */
  spaFallback?: boolean;

  /**
   * Prefix to include env vars (default: 'VITE_')
   */
  envPrefix?: string | string[];

  /**
   * Route that returns JS assigning window.__ENV__ (default: '/env.js')
   */
  envJsPath?: string;

  /**
   * Route that returns JSON runtime config (default: disabled)
   */
  configJsonPath?: string | null;

  /**
   * Name of global for injected env payload (default: '__ENV__')
   */
  globalName?: string;

  /**
   * Additional headers or header function
   */
  headers?: Record<string, string> | ((path: string) => Record<string, string>);

  /**
   * Cache-Control header values
   */
  cacheControl?: {
    html?: string;
    assets?: string;
    other?: string;
  };

  /**
   * Customize which keys from process.env are exposed
   */
  expose?: (key: string, value: string | undefined) => boolean;

  /**
   * Enable request logging (default: true)
   */
  log?: boolean;

  /**
   * Defaults for MODE/BASE_URL
   */
  defaults?: {
    mode?: string;
    baseUrl?: string;
  };

  /**
   * Whether to include Vite-like meta flags (default: true)
   */
  includeMetaFlags?: boolean;
}

export interface ImportMetaEnvLike {
  MODE: string;
  BASE_URL: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

export interface ResolvedProductionServerOptions extends Omit<ProductionServerOptions, 'cacheControl' | 'defaults' | 'envPrefix'> {
  distDir: string;
  port: number;
  host: string;
  base: string;
  spaFallback: boolean;
  envPrefix: string[];
  envJsPath: string;
  configJsonPath: string | null;
  globalName: string;
  cacheControl: {
    html: string;
    assets: string;
    other: string;
  };
  log: boolean;
  defaults: {
    mode: string;
    baseUrl: string;
  };
  includeMetaFlags: boolean;
}
