import { modClamp } from "src/util/numbers";

export function arrayWrap<T>(array: T): T extends unknown[] ? T : T[] {
  return Array.isArray(array) ? array : ([array] as any);
}

export function cycleArray<T>(array: T[], index: number): T {
  if (!array.length) return undefined as any;
  return array[modClamp(index, 0, array.length)];
}
