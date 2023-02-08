export type ArrayOr<T> = T | T[];
export type PromiseOr<T> = T | Promise<T>;
export type Subscriber<T extends unknown[]> = (...params: T) => void;
export type SubscribeFunction<T extends unknown[]> = (listeners: ArrayOr<Subscriber<T>>) => () => void;
export type NotifyFunction<T extends unknown[]> = (...value: T) => void;

export interface SubscribableOptions {
  maxListeners?: number;
}

export interface Subscribable<T extends unknown[]> {
  subscribe: SubscribeFunction<T>;
}

export interface Notifiable<T extends unknown[]> {
  notify: NotifyFunction<T>;
}

export interface StoreOptions extends SubscribableOptions {
  immediatelyNotify?: boolean;
}

export type UpdateFunction<T> = (value: T) => PromiseOr<T>;
export type PatchFunction<T> = (value: T) => PromiseOr<Partial<T>>;
export type StoreSubscriber<T> = (newValue: T, oldValue?: T) => void;
export type StoreSubscribeFunction<T> = SubscribeFunction<[newValue: T, oldValue?: T]>;
export type StoreGetter<T> = () => T;
export type StoreSetter<T> = ((value: T) => void) & ((updater: UpdateFunction<T>) => Promise<void>);
export type StorePatcher<T> = ((value: Partial<T>) => void) & ((patcher: PatchFunction<T>) => Promise<void>);

export interface ReadonlyStore<T> {
  get: StoreGetter<T>;
  subscribe: StoreSubscribeFunction<T>;
}

export interface PatchableStore<T> {
  patch: StorePatcher<T>;
}

export interface WritableStore<T> {
  set: StoreSetter<T>;
}

export interface AccessibleStore<T> {
  get value(): T;
  set value(val: T);
}
