import { createStore } from "src/renderer/store/simple-store/store";

export type MaybeGeolocationPosition = (GeolocationPosition & { enabled: true }) | { enabled: false };
function createLocationStore() {
  const { set, get, subscribe } = createStore<MaybeGeolocationPosition>({ enabled: false } as any);

  let watchId: number;

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(position => {
      set({ ...position, enabled: true } as MaybeGeolocationPosition);
    });
  }

  function enable() {
    watchId = navigator.geolocation.watchPosition(position => {
      set({ ...position, enabled: true });
    });
  }

  function disable() {
    navigator.geolocation.clearWatch(watchId);
    set({ enabled: false });
  }

  return {
    get,
    subscribe,
    enable,
    disable,
    get value() {
      return get();
    },
  };
}

export const currentLocation = createLocationStore();
