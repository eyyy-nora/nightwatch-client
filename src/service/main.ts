import express from "express";
import "reflect-metadata";
import { TypeormStore } from "connect-typeorm";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import { withDataSource } from "src/service/data-source";
import { env, isDev } from "src/service/env";
import { initTags } from "src/service/imports/init-tags";
import { hamburgImporter } from "src/service/imports/sources/hamburg";

export async function init() {
  const dataSource = await withDataSource();
  console.log("db up!");
  await initTags();
  // await imports();
  console.log("imports done!");
  const app = express();

  const { Session } = await import("src/entity/session");

  app.use(
    cookieParser(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    session({
      secret: env("session_secret", "nightwatch"),
      resave: true,
      saveUninitialized: true,
      cookie: {},
      store: new TypeormStore({
        cleanupLimit: 2,
        limitSubquery: false,
        ttl: 86400,
      }).connect(dataSource.getRepository(Session)),
    }),
  );

  const { routes } = await import("src/service/routes");
  app.use("/api", routes);
  console.log("routes registered!");

  app.listen(env("nightwatch_port", 3000), () => {
    console.log("server up!");
  });
}

init().then();

export async function imports() {
  await hamburgImporter();
}
