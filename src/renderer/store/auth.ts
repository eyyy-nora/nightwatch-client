import axios from "axios";
import { Location } from "src/entity/location";
import { User } from "src/entity/user";
import { createStore } from "src/renderer/store/simple-store/store";

export function createAuthStore() {
  const { set, get, subscribe } = createStore<User | undefined>(undefined);
  const client = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/auth` });
  async function oauth(service: string) {
    location.href = `${import.meta.env.VITE_API_URL}/api/auth/${service}/authorize?referer=${encodeURIComponent(
      location.href,
    )}`;
  }

  async function logout() {
    const user = get();
    if (!user) return;
    await client.get(`/${user.oauthSource}/logout`);
    set(undefined);
  }

  async function checkIn(location: Location) {
    await client.post(`/check-in/${location.id}`).then(({ data }) => set(data));
  }

  async function checkOut() {
    await client.post("/check-out").then(({ data }) => set(data));
  }

  client
    .get("/me")
    .then(({ data }) => set(data))
    .catch();

  return { get, subscribe, oauth, logout, checkIn, checkOut };
}

export const authStore = createAuthStore();

authStore.subscribe(console.log);
