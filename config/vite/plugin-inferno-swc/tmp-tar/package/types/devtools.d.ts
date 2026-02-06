import { Plugin } from 'vite';
import type { RollupFilter } from './types';
export interface DevtoolsPluginOptions {
    /**  */
    injectInProd?: boolean;
    /**  */
    shouldTransform: RollupFilter;
}
export declare function infernoDevtoolsPlugin({ injectInProd, shouldTransform, }: DevtoolsPluginOptions): Plugin;
