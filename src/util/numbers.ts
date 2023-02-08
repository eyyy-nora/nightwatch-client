const { floor, ceil, round, min, max, abs } = Math;

export function modClamp(n: number, lower: number, upper: number) {
  n -= lower;
  upper -= lower;
  if (n > upper) {
    const count = floor(n / upper);
    return n - count * upper + lower;
  } else if (n < 0) {
    const count = ceil(-n / upper);
    return n + count * upper + lower;
  } else return n + lower;
}

export function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

export function roundToMultiple(n: number, step: number, offset = 0) {
  return round((n - offset) / step) * step + offset;
}

export function angleDistance(a: number, b: number) {
  return circularDistance(a, b, 360);
}

export function circularDistance(a: number, b: number, bound: number) {
  const rangeA = abs(b - a);
  const rangeB = abs(b > a ? b - (a + bound) : b + bound - a);
  return min(rangeA, rangeB);
}

export function lerpCircular(a: number, b: number, bound: number, n: number) {
  a %= bound;
  b %= bound;
  const rangeA = b - a;
  const rangeB = b > a ? b - (a + bound) : b + bound - a;
  if (abs(rangeA) < abs(rangeB)) return modClamp(lerp(a, b, n), 0, bound);
  else return modClamp(b > a ? lerp(a + bound, b, n) : lerp(a, b + bound, n), 0, bound);
}

export function clamp(value: number, minVal: number = 0, maxVal: number = 1): number {
  return min(maxVal, max(minVal, value));
}

export function* range(lower: number, higher?: number, step: number = 1): Iterable<number> {
  if (higher === undefined) {
    higher = lower;
    lower = 0;
  }
  if ((lower > higher && step > 0) || (higher > lower && step < 0)) step = -step;
  if (lower === higher) yield lower;
  else if (lower > higher) for (let i = lower; i > higher; i += step) yield i;
  else for (let i = lower; i < higher; i += step) yield i;
}

export function* mapIterator<T, R>(iterator: Iterable<T>, mapping: (arg: T) => R): Iterable<R> {
  for (const i of iterator) yield mapping(i);
}
