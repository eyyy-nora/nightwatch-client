import { Location } from "src/entity/location";
import { Rating } from "src/entity/rating";
import { Session } from "src/entity/session";
import { Tag } from "src/entity/tag";
import { User } from "src/entity/user";
import { env, isDev } from "src/service/env";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: env("postgres_host", "localhost"),
  port: env("postgres_port", 5432),
  database: env("postgres_database", "nightwatch"),
  username: env("postgres_username", "nightwatch"),
  password: env("postgres_password", "nightwatch"),
  synchronize: isDev(),
  logging: false, //isDev(),
  entities: [Location, Session, User, Tag, Rating],
  migrations: [],
  subscribers: [],
});

let initialising: Promise<DataSource> | undefined = undefined;
export async function withDataSource() {
  if (dataSource.isInitialized) return dataSource;
  if (initialising) return initialising;
  return (initialising = dataSource.initialize().then(async dataSource => {
    initialising = undefined;
    return dataSource;
  }));
}
