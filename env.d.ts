declare module "virtual:import-meta-env" {
  interface ImportMetaEnvLike {
    MODE: string;
    BASE_URL: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
    [key: string]: any;
  }

  const env: ImportMetaEnvLike;
  export default env;
}

declare module "virtual:runtime-env" {
  export type ImportMetaEnvLike = {
    MODE: string;
    BASE_URL: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
    [key: string]: any;
  };

  export function getEnv(): ImportMetaEnvLike;
  export function env(key: string): string | undefined;
  export function envOrThrow(key: string): string;
  export function refreshEnv(): Promise<void> | void;
}
