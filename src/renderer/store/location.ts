import axios from "axios";
import type { Location } from "src/entity/location";
import { Tag } from "src/entity/tag";
import { createStore } from "src/renderer/store/simple-store/store";
import { PagedResponse } from "src/types/paged-response";
import { sleep } from "src/util/sleep";

export function createLocationStore() {
  const { get, subscribe, set, patch } = createStore<{ busy: boolean; locations: Location[]; selected?: Location }>({
    busy: false,
    locations: [],
  });
  const tags = createStore<{ tags: Tag[]; lookup: Record<string, Tag> }>({ tags: [], lookup: {} });
  const client = axios.create({ baseURL: import.meta.env.VITE_API_URL + "/api" });

  async function load() {
    patch({ busy: true });
    const { data } = await client.get<PagedResponse<Location>>("/location");
    const {
      data: { items },
    } = await client.get<PagedResponse<Tag>>("/tag", { params: { take: 1000 } });
    tags.set({ tags: items, lookup: createTagLookup(items) });
    const prevSelected = get().selected?.id;
    set({ busy: false, locations: data.items, selected: data.items.find(it => it.id === prevSelected) ?? undefined });
  }

  function createTagLookup(tags: Tag[]): Record<string, Tag> {
    return Object.fromEntries(
      tags.map(tag => {
        return [tag.id, tag];
      }),
    );
  }

  function select(selected?: Location) {
    patch({ selected });
  }

  async function retryLoad() {
    try {
      await load();
    } catch {
      await sleep(2000);
      await retryLoad();
    }
  }

  retryLoad().then();

  return { get, subscribe, load, select, tags };
}

export const locationStore = createLocationStore();
