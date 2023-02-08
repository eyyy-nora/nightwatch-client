import { useEffect, useState } from "react";
import type { ReadonlyStore } from "src/renderer/store/simple-store/types";

export function useStore<T>(store: ReadonlyStore<T>) {
  const [data, setData] = useState(store.get());
  useEffect(() => store.subscribe(setData));
  return data;
}
