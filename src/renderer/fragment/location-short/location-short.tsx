import { Button, Divider } from "antd";
import React, { useCallback, useMemo } from "react";
import { Location, WeekDay } from "src/entity/location";
import { Icon } from "src/renderer/component/typography/icon";
import { authStore } from "src/renderer/store/auth";
import { locationStore } from "src/renderer/store/location";
import { useStore } from "src/renderer/store/simple-store/use-store";

export interface LocationShortProps {
  location: Location;
}

const weekDays: WeekDay[] = ["mo", "tu", "we", "th", "fr", "sa", "su"];
export function LocationShort({ location }: LocationShortProps) {
  const user = useStore(authStore);
  const timeframe = useMemo(() => {
    const now = new Date();
    const frames = location.openAt[weekDays[now.getDay()]] ?? [];
    return frames.map(([from, to]) => `${0 | (from / 60)}:${0 | from % 60} - ${0 | (to / 60)}:${0 | to % 60}`);
  }, [location]);

  const open = useMemo(() => {
    const now = new Date();
    const frames = location.openAt[weekDays[now.getDay()]];
    if (frames && frames.length)
      return !!frames.find(([start, end]) => {
        const timeVal = now.getHours() * 60 + now.getMinutes();
        return start <= timeVal && timeVal < end;
      });
    return false;
  }, [location]);

  const checkIn = useMemo(() => {
    if (!user) return;
    if (user.location?.id === location.id) return <Button onClick={authStore.checkOut}>Auschecken</Button>;
    return <Button onClick={() => authStore.checkIn(location)}>Einchecken</Button>;
  }, [location, user]);

  return (
    <div className="flex flex-col">
      <strong className="text-base">{location.name}</strong>
      <div>
        <div className="flex flex-row wrap">
          {location.tags.map(tag => (
            <div className="bg-gray-200 rounded px-1">
              <Icon icon={tag.icon as any} /> {tag.name}
            </div>
          ))}
        </div>

        {open ? <span className="text-green-500">Geöffnet</span> : <span className="text-rose-500">Geschlossen</span>}
        <div className="text-gray-500 flex flex-col items-center px-3">
          {timeframe.map((formatted, index) => (
            <span key={index}>{formatted}</span>
          ))}
        </div>
      </div>

      {checkIn}
    </div>
  );
}
