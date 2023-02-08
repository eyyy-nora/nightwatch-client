import { createService } from "@propero/easy-api";
import axios from "axios";
import { Router } from "express";
import { Location } from "src/entity/location";
import { Rating } from "src/entity/rating";
import { Tag } from "src/entity/tag";
import { User } from "src/entity/user";
import { dataSource } from "src/service/data-source";
import { env } from "src/service/env";
import { OAuthService } from "src/service/services/oauth-service";
import { RepoService } from "src/service/services/repo-service";
import { UserService } from "src/service/services/user-service";

export const routes = Router();

routes.use(
  "/location",
  createService(
    new RepoService({
      entity: Location,
      dataSource,
      exclude: [],
      defaults: {
        relations: ["tags", "ratings"],
      },
      allowed(req, operation, data) {
        return operation === "read";
      },
    }),
  ),
);

routes.use(
  "/tag",
  createService(
    new RepoService({
      entity: Tag,
      dataSource,
      exclude: [],
      allowed(req, op) {
        return op === "read";
      },
    }),
  ),
);

routes.use(
  "/rating",
  createService(
    new RepoService({
      entity: Rating,
      dataSource,
      exclude: [],
      filter(req) {
        return { user: { uuid: req.session.user?.uuid } };
      },
      allowed(req) {
        return !!req.session.user;
      },
    }),
  ),
);

routes.use(
  "/users",
  createService(
    new RepoService({
      entity: User,
      dataSource,
      exclude: [],
      filter(req) {
        return { uuid: req.session.user?.uuid };
      },
      allowed(req, op) {
        return op === "read" && !!req.session.user;
      },
    }),
  ),
);

routes.use(
  "/auth/discord",
  createService(
    new OAuthService(
      env("discord_target_uri"),
      env("discord_client_id"),
      env("discord_client_secret"),
      env("discord_redirect_uri"),
      env("discord_scope", "identify email"),
      async data => {
        const { access_token, token_type } = data;
        const { data: userData } = await axios.get("https://discordapp.com/api/users/@me", {
          headers: { Authorization: `${token_type} ${access_token}` },
        });

        const repo = dataSource.getRepository(User);
        const filter = { oauthSource: "discord", oauthData: { id: userData.id } as any };
        const user = (await repo.findOne({ where: filter })) ?? repo.create(filter);

        user.oauthData = data;
        user.name = userData.username;
        user.picture = `//cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        user.email = userData.email;
        user.oauthUser = userData;

        await repo.save(user);

        return user;
      },
      user => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        return user.oauthData?.refresh_token ?? user.oauthData?.access_token!;
      },
    ),
  ),
);

routes.use("/auth", createService(new UserService()));
