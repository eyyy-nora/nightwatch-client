import React from "react";
import { StreetMap } from "src/renderer/component/map/street-map";
import { BusyOverlay } from "src/renderer/component/page/busy/busy-overlay";
import { currentLocation } from "src/renderer/store/current-location";
import { locationStore } from "src/renderer/store/location";
import { useStore } from "src/renderer/store/simple-store/use-store";

export function StreetMapView() {
  const location = useStore(currentLocation);
  const { locations, busy, selected } = useStore(locationStore);
  return (
    <BusyOverlay busy={busy}>
      {!busy && (
        <StreetMap
          locations={locations}
          center={location.enabled ? location : undefined}
          onLocationClick={locationStore.select}
          selected={selected}
        />
      )}
    </BusyOverlay>
  );
}
