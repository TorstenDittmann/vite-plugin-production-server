import type { ProductionServerOptions } from '../types.js';
/**
 * Start the production server
 */
export declare function startProductionServer(options?: ProductionServerOptions): Promise<{
    close(): Promise<void>;
}>;
