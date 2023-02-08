export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; ++i) hash = 0 | ((hash << 5) - hash + str.charCodeAt(i));
  return hash;
}
