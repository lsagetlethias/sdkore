import { GlobalStore } from './store/GlobalStore';

export * from './utils/client';
export { Logger } from './utils/Logger';
export * from './utils/Types';
export { Trait } from './Trait';
export * from './cache';
export * from './DAO';
export * from './DTO';
export * from './@';
export * from './error';

import * as Const from './utils/Const';
export { Const };

declare const VERSION: string;
export const version: string = VERSION;

// Quick fix for "for await"
/* istanbul ignore next: browser specific */
if (!Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}

// Global functions
export function setDebug(debug: boolean = true) {
    GlobalStore.debug = debug;
}

/* istanbul ignore next: propagator are still WIP */
export function disablePropagators() {
    GlobalStore.propagation = false;
}

export function setLogger(logger: Console) {
    GlobalStore.console = logger;
}

export const addPropagator: typeof GlobalStore.addPropagator = GlobalStore.addPropagator.bind(GlobalStore);
