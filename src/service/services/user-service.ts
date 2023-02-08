import { Get, intParser, Param, Post, ResponseStatus, Service, Session } from "@propero/easy-api";
import { User } from "src/entity/user";
import { dataSource } from "src/service/data-source";
import { Location } from "src/entity/location";

@Service()
export class UserService {
  @Get("/me")
  async me(@Session("user") user: User) {
    if (!user) return { status: ResponseStatus.UNAUTHORIZED, data: { error: "Unauthorized" } };
    const { name, admin, email, location, picture, uuid, oauthSource } = user;
    return {
      name,
      admin,
      email,
      location,
      picture,
      uuid,
      oauthSource,
    };
  }

  @Post("/check-in/:locationId")
  async checkIn(@Session("user") user: User, @Param("locationId", intParser()) locationId: number) {
    if (!user) return { status: ResponseStatus.UNAUTHORIZED, data: { error: "Unauthorized" } };
    if (!locationId) return { status: ResponseStatus.BAD_REQUEST, data: { error: "Missing Location Id" } };
    user.location = (await dataSource.getRepository(Location).findOne({ where: { id: locationId } })) ?? undefined;
    await dataSource.getRepository(User).save(user);
    return this.me(user);
  }

  @Post("/check-out")
  async checkOut(@Session("user") user: User) {
    if (!user) return { status: ResponseStatus.UNAUTHORIZED, data: { error: "Unauthorized" } };
    user.location = undefined;
    await dataSource.getRepository(User).save(user);
    return this.me(user);
  }
}
