import { ValueTransformer } from "typeorm";

export function stringList(separator = ";"): ValueTransformer {
  return {
    to(value) {
      if (Array.isArray(value)) return value.join(separator);
      else return;
    },
    from(value: any): any {
      if (typeof value !== "string" || !value) return [];
      return value.split(separator);
    },
  };
}
