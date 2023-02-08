import axios from "axios";
import React, { useMemo } from "react";
import { ResponsiveProvider } from "src/renderer/context/tailwind-context";
import { MenuBar, MenuBarEntry } from "src/renderer/fragment/menu-bar";
import { StreetMapView } from "src/renderer/view/street-map-view";

Object.assign(window, { axios });

export function App() {
  const entries = useMemo<MenuBarEntry[]>(() => {
    return [
      {
        icon: "geo-alt",
        label: "Karte",
        key: "map",
        content: () => <StreetMapView />,
      },
      {
        icon: "search",
        label: "Suche",
        key: "search",
      },
      {
        icon: "envelope",
        label: "Benachrichtigungen",
        key: "notifications",
        content: () => {
          const discordOauthUrl = `${
            import.meta.env.VITE_API_URL
          }/api/auth/discord/authorize?referer=${encodeURIComponent(window.location.href)}`;

          return (
            <button type="button" onClick={() => (window.location.href = discordOauthUrl)}>
              Login with Discord!
            </button>
          );
        },
      },
    ];
  }, []);

  return (
    <ResponsiveProvider>
      <MenuBar entries={entries} />
    </ResponsiveProvider>
  );
}
