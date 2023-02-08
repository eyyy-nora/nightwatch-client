import { Service } from "@propero/easy-api";
import { Location } from "src/entity/location";
import { RepoService } from "src/service/services/repo-service";
import { dataSource } from "../data-source";

@Service()
export class LocationService extends RepoService<Location> {
  constructor() {
    super({
      entity: Location,
      dataSource,
    });
  }
}
