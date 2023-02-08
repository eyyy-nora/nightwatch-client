import type { Point } from "geojson";
import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Location } from "src/entity/location";
import "./street-map.css";
import "leaflet/dist/leaflet.css";
import { LocationShort } from "src/renderer/fragment/location-short/location-short";

export function StreetMap({
  locations,
  center,
  onLocationClick,
  selected,
}: {
  locations: Location[];
  center?: GeolocationPosition;
  onLocationClick?(location: Location): void;
  selected?: Location;
}) {
  const markers = useRef({} as Record<string, any>);
  const [loaded, setLoaded] = useState(false);

  const centerCoords: [number, number] = useMemo(() => {
    if (center) return [center.coords.latitude, center.coords.longitude];
    if (selected) return (selected.geometry as Point).coordinates.slice().reverse() as [number, number];
    if (locations.length) {
      return locations
        .map(it => (it.geometry as Point).coordinates)
        .filter(it => it)
        .reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2])
        .map(it => it / locations.length)
        .reverse() as [number, number];
    }
    return [0, 0];
  }, [center, selected, locations]);

  const handlers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(locations).map(([index, location]) => {
        return [index, () => onLocationClick?.(location)];
      }),
    );
  }, [locations]);

  useEffect(() => {
    console.log(loaded, selected, selected && markers.current?.[selected.id]);
    if (loaded && selected) markers.current[selected.id].openPopup();
  }, [loaded, selected]);

  return (
    <MapContainer center={centerCoords} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, index, all) => (
        <GeoJSON
          ref={marker => {
            markers.current[location.id] = marker;
            if (index === all.length - 1) setLoaded(true);
          }}
          data={location.geometry}
          key={location.id}
          interactive
          eventHandlers={{
            click: handlers[index],
          }}>
          <Popup>
            <LocationShort location={location} />
          </Popup>
        </GeoJSON>
        /*<Marker position={(location.geometry as Point).coordinates as any} key={location.id}>
          <Popup content={location.name}></Popup>
        </Marker>*/
      ))}
    </MapContainer>
  );
}
