import type { Geometry } from "geojson";
import { Location } from "src/entity/location";
import { Tag } from "src/entity/tag";
import { withDataSource } from "src/service/data-source";
import { createApiResultGenerator } from "src/service/imports/create-api-result-generator";
import { createImporter } from "src/service/imports/create-importer";
import { Repository } from "typeorm";

interface ApiHamburgLocation {
  type: "Feature";
  id: string;
  geometry: Geometry;
  properties: {
    strasse: string;
    plaetze: number;
    traeger: string;
    art: number;
    ort: string;
    haus_nr: string;
  };
  srsName: string;
}
interface ApiHamburgResponse {
  type: "FeatureCollection";
  features: ApiHamburgLocation[];
  links: {
    href: string;
    rel: string;
    type: string;
    title: string;
  }[];
  numberMatched: number;
  numberReturned: number;
  timeStamp: string;
  crs: string;
}

function hamburgLocations() {
  return createApiResultGenerator<ApiHamburgResponse, ApiHamburgLocation[]>({
    resolve: res => res.data.features,
  })({
    method: "get",
    url: "https://api.hamburg.de/datasets/v1/uebernachtungsangebote/collections/uebernachtungsangebote/items",
    headers: { "Content-Type": "application/json" },
  });
}

async function mapHamburgLocations(data: ApiHamburgLocation[], repo: Repository<Location>): Promise<Location[]> {
  const source = "https://api.hamburg.de/datasets/v1/uebernachtungsangebote/collections/uebernachtungsangebote/items";

  return Promise.all(
    data.map(async item => {
      const entity =
        (await repo.findOne({ where: { sourceId: item.id, source }, relations: ["tags"] })) ?? repo.create();

      entity.geometry = item.geometry;
      entity.sourceId = item.id;
      entity.source = source;
      entity.address = {
        country: "germany",
        county: "hamburg",
        city: "hamburg",
        street: item.properties.strasse.trim(),
        streetNo: item.properties.haus_nr.trim(),
      };
      entity.places = item.properties.plaetze;
      entity.name = item.properties.traeger.trim();
      if (!entity.tags?.find(it => it.id === "shelter")) (entity.tags ??= []).push({ id: "shelter" } as Tag);

      return entity;
    }),
  );
}

export const hamburgImporter = createImporter(hamburgLocations, mapHamburgLocations, () => Location, withDataSource);
