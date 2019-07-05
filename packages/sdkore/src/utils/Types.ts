export type Except<T, K extends keyof T> = Pick<T, { [P in keyof T]: P extends K ? never : P }[keyof T]>;
export type Only<T, K extends keyof T> = Pick<T, { [P in keyof T]: P extends K ? P : never }[keyof T]>;

export type ClassExcept<T, P extends keyof T> = ClassType<Except<T, P>>;
export type ClassOnly<T, P extends keyof T> = ClassType<Only<T, P>>;

export interface ClassType<T> {
    new (...args: any[]): T;
    [P: string]: any;
}

export type PartialPlus<T, K extends keyof T = keyof T> = Except<T, K> & Only<Partial<T>, K>;
export type RPartial<T, K extends keyof T = keyof T> = Except<Partial<T>, K> & Only<T, K>;

export type RequiredPlus<T, K extends keyof T = keyof T> = Except<T, K> & Only<Required<T>, K>;
export type RRequired<T, K extends keyof T = keyof T> = Except<Required<T>, K> & Only<T, K>;

export type ReadonlyPlus<T, K extends keyof T = keyof T> = Except<T, K> & Only<Readonly<T>, K>;
export type RReadonly<T, K extends keyof T = keyof T> = Except<Readonly<T>, K> & Only<T, K>;

export type UnReadonly<T> = { -readonly [P in keyof T]: T[P] };
export type UnReadonlyPlus<T, K extends keyof T = keyof T> = Except<T, K> & Only<UnReadonly<T>, K>;
export type RUnReadonly<T, K extends keyof T = keyof T> = Except<UnReadonly<T>, K> & Only<T, K>;

export type IsValidArg<T> = T extends object ? (keyof T extends never ? false : true) : true;

export type Typeof<T> = new (...args: any[]) => T;

/**
 * Box the return type of a function with Promise.
 * e.g. Aync<() => string> = () => Promise<string>
 *
 * Handle when a Promise is already the return type.
 * e.g. Async<() => Promise<string>> = () => Promise<string>
 *
 * Transform as never if given type is not a function.
 * e.g. Async<number> = never
 *
 * But you can force the return anyway by passing true to the second generic.
 * e.g. Async<number, true> = number
 */
export type Async<T, TReturnAnyway extends boolean = false> = T extends (...args: infer A) => infer R
    ? (...args: A) => R extends Promise<any> ? R : Promise<R>
    : TReturnAnyway extends true
    ? T
    : never;
