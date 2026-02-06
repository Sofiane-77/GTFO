import type { Plugin } from 'vite';
import type { InfernoPluginOptions } from './types';
export default function infernoPlugin({ devtoolsInProd, include, exclude, babel, }?: InfernoPluginOptions): Plugin[];
