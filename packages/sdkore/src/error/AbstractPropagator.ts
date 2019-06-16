import { IPropagatorAware } from './IPropagatorAware';

/* istanbul ignore next: WIP */
/**
 * Propagate any log or data to an external service (monitoring, Sentry, etc)
 *
 * @wip
 */
export abstract class AbstractPropagator implements IPropagatorAware {
    public abstract propagate(data: any): void;
}
