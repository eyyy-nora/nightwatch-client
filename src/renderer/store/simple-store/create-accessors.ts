import type { AccessibleStore, StoreGetter, StoreSetter } from "src/renderer/store/simple-store/types";

export function createAccessors<T, Val>(obj: Val, get: StoreGetter<T>, set: StoreSetter<T>): Val & AccessibleStore<T> {
  return {
    ...obj,
    get value() {
      return get();
    },
    set value(val) {
      set(val as any);
    },
  };
}
