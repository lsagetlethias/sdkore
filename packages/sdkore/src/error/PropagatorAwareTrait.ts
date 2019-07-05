import { Trait } from '@bios21/tstrait';
import { GlobalStore } from '../store/GlobalStore';
import { IPropagatorAware } from './IPropagatorAware';

/* istanbul ignore next: WIP */
/**
 * Classes using this trait can propagate data to propagators.
 *
 * @wip
 */
export class PropagatorAwareTrait extends Trait implements IPropagatorAware {
    public propagate(data: unknown) {
        if (GlobalStore.propagation) {
            GlobalStore.logPropagators.forEach(p => p.propagate(data));
        }
    }
}
