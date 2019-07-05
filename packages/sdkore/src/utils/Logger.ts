import { Use } from '@bios21/tstrait';
import { PropagatorAwareTrait } from '../error/PropagatorAwareTrait';
import { GlobalStore } from '../store/GlobalStore';

function noop() {}
const NoOpConsole: Console = {
    error: noop,
    info: noop,
    log: noop,
    warn: noop,
} as any;

/**
 * Basic window.console based Logger. It will also propagate data.
 *
 * Format and color every logs.
 */
@Use(PropagatorAwareTrait)
class LoggerClass {
    private readonly that: PropagatorAwareTrait & LoggerClass = this as any;
    private console = GlobalStore.console;
    private debug = GlobalStore.debug;

    private inited = false;

    private readonly color = {
        error: 'color: red; font-weight: bold;',
        info: 'color: royalblue;',
        light: 'color: white; font-weight: bold;',
        normal: 'color: white;',
        warn: 'color: orange;',
    };

    /**
     * Constructs the Logger. It will also weave (wrap with functions) all inner methods with init() and propagate()
     */
    public constructor(private readonly name: string = 'SDKore') {
        // weaver
        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(p => !['constructor', 'init', 'propagate'].includes(p))
            .forEach(p => {
                const original = this[p];
                this[p] = (...args: any[]) => {
                    this.init();
                    original.call(this, ...args);
                    const data = Array.from(args);
                    data.shift();
                    this.that.propagate(data);
                };
            });
    }

    private init() {
        if (this.inited) {
            return;
        }
        this.inited = true;
        this.console = GlobalStore.console || NoOpConsole;
        this.debug = GlobalStore.debug;
        if (!this.debug) {
            const copy = this.console;
            this.console = {} as any;
            Object.keys(copy).forEach(p => {
                this.console[p] = () => {
                    return;
                };
            });
            return;
        }
    }

    public log(message: string, ...data: any[]) {
        this.console.log('%c[%s][LOG]%c %s', this.color.light, '', this.name, message, ...data);
    }

    public info(message: string, ...data: any[]) {
        this.console.info('%c[%s][INFO]%c %s', this.color.info, '', this.name, message, ...data);
    }

    public warn(message: string, ...data: any[]) {
        this.console.warn('%c[%s][WARN]%c %s', this.color.warn, '', this.name, message, ...data);
    }

    public error(message: string, ...data: any[]) {
        this.console.error('%c[%s][ERROR]%c %s', this.color.error, '', this.name, message, ...data);
    }
}

export const Logger = new LoggerClass();
