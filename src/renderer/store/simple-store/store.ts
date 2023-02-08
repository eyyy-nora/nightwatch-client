import { createAccessors } from "src/renderer/store/simple-store/create-accessors";
import { createGetSet } from "src/renderer/store/simple-store/create-get-set";
import { createPatch } from "src/renderer/store/simple-store/create-patch";
import { createStoreSubscribe } from "src/renderer/store/simple-store/create-store-subscribe";
import { createSubscribable } from "src/renderer/store/simple-store/subscribable";
import type {
  AccessibleStore,
  PatchableStore,
  ReadonlyStore,
  StoreOptions,
  WritableStore,
} from "src/renderer/store/simple-store/types";

export function createStore<T>(
  initialValue: T,
  { maxListeners, immediatelyNotify }: StoreOptions = {},
): ReadonlyStore<T> & PatchableStore<T> & WritableStore<T> & AccessibleStore<T> {
  const { subscribe: sub, notify } = createSubscribable<[newVal: T, oldVal?: T]>({ maxListeners });
  const [get, set] = createGetSet(initialValue, notify);
  const patch = createPatch(get, set);
  const subscribe = createStoreSubscribe(sub, get, immediatelyNotify);
  return createAccessors({ subscribe, set, get, patch }, get, set);
}
