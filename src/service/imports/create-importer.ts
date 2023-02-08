import { arrayWrap, Constructor } from "@propero/easy-api";
import { DataSource, ObjectLiteral, Repository } from "typeorm";

export function createImporter<Data, Result extends ObjectLiteral>(
  generator: () => AsyncGenerator<Data>,
  map: (result: Data, repo: Repository<Result>) => Promise<Result | Result[]>,
  entity: () => Constructor<Result>,
  dataSource: DataSource | (() => DataSource | Promise<DataSource>),
) {
  return async function () {
    const source = typeof dataSource === "function" ? await dataSource() : dataSource;
    const e = entity();
    const repo = source.getRepository(e);
    const conflictPaths = repo.metadata.primaryColumns.map(col => col.propertyName);
    const relations = repo.metadata.relations;
    for await (const data of generator()) {
      const items = arrayWrap(await map(data, repo));
      await repo.upsert(items, { skipUpdateIfNoValuesChanged: true, conflictPaths });
      for (const item of items) {
        for (const relation of relations) {
          if (item[relation.propertyName]) {
            try {
              await source
                .createQueryBuilder()
                .relation(e, relation.propertyName)
                .of(item)
                .add(item[relation.propertyName]);
            } finally {
            }
          }
        }
      }
    }
  };
}
