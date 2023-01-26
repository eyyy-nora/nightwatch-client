import { readFile, writeFile } from "fs/promises";

export function jsonStore<T>(fileName: string, defaultValue: T) {
  let data: T = defaultValue;
  async function load() {
    try {
      data = JSON.parse(await readFile(fileName, "utf-8"));
    } catch {
      await save();
    }
  }
  async function save() {
    await writeFile(fileName, JSON.stringify(data), "utf-8");
  }

  load();
  return {
    get value() {
      return data;
    },
    set value(val: T) {
      data = val;
      save();
    },
    load,
    save,
  };
}
