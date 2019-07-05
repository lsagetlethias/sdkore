import { AbstractPropagator } from '../error';

/* istanbul ignore next: Store does not contains any exotic logic to test */
class GlobalStoreClass {
    private _lastClientId: symbol;
    private _debug: boolean = false;
    private _propagation: boolean = true;
    private _propagatorsList: AbstractPropagator[] = [];
    private _console: Console = console;

    public get lastClientId(): symbol {
        return this._lastClientId;
    }

    public set lastClientId(value: symbol) {
        this._lastClientId = value;
    }

    public set debug(value: boolean) {
        this._debug = value;
    }

    public get debug(): boolean {
        return this._debug;
    }

    public set propagation(value: boolean) {
        this._propagation = value;
    }

    public get propagation(): boolean {
        return this._propagation;
    }

    public get logPropagators(): AbstractPropagator[] {
        return this._propagatorsList;
    }

    public addPropagator(...propagator: AbstractPropagator[]): number {
        return this._propagatorsList.push(...propagator);
    }

    public get console(): Console {
        return this._console;
    }

    public set console(value: Console) {
        this._console = value;
    }
}

export const GlobalStore = new GlobalStoreClass();
