import { config } from "dotenv";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type EnvKey = keyof (typeof process)["env"] & string;

let configured = false;
export function env<T>(key: Lowercase<EnvKey>, defaultValue?: T): T {
  if (!configured) {
    config();
    configured = true;
  }
  const value = process.env[key.toUpperCase()];
  if (value == null) {
    if (typeof defaultValue === "undefined") throw new Error(`Undefined environment variable: ${key}`);
    return defaultValue;
  }
  switch (typeof defaultValue) {
    case "string":
      return value as T;
    case "number":
      return isNaN(+value) ? defaultValue : (+value as T);
    case "boolean":
      return (value === "true" || value === "1") as T;
    case "object":
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    case "bigint":
      return BigInt(value) as T;
    case "undefined":
      return value as T;
    case "symbol":
      return Symbol.for(value) as T;
    case "function":
      throw new TypeError("function type env variables not supported!");
  }
  throw new TypeError("unsupported default value");
}

let dev: boolean | undefined = undefined;
export function isDev() {
  if (dev != null) return dev;
  return (dev = env<string>("node_env", "production") === "development");
}
