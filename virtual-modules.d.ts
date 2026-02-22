interface ImportMetaEnvLike {
  MODE: string;
  BASE_URL: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

declare module 'virtual:import-meta-env' {
  const env: ImportMetaEnvLike;
  export default env;
}

declare module 'virtual:runtime-env' {
  export function getEnv(): ImportMetaEnvLike;
  export function env(key: string): string | undefined;
  export function envOrThrow(key: string): string;
  export function refreshEnv(): void;
}
