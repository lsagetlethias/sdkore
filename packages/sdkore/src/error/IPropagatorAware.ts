/**
 * Used both by propagator classes AND by classes that uses propagator.
 */
export interface IPropagatorAware {
    propagate?(data: unknown): void;
}
