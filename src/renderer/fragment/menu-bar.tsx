import { Avatar, Button, Popover, Typography } from "antd";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { Drawer, DrawerProps } from "src/renderer/component/layout/drawer/drawer";
import { Menu, MenuEntryProps } from "src/renderer/component/page/menu/menu";
import { Icon } from "src/renderer/component/typography/icon";
import { useAbove, useBelow, useBetween, useResponsive } from "src/renderer/context/tailwind-context";
import { authStore } from "src/renderer/store/auth";
import { useStore } from "src/renderer/store/simple-store/use-store";
import classes from "./menu-bar.module.css";

const menuEntries: MenuEntryProps[] = [
  {
    icon: "house",
    label: "Home",
    key: "home",
  },
  {
    icon: "search",
    label: "Suche",
    key: "search",
  },
  {
    icon: "geo-alt",
    label: "Map",
    key: "map",
  },
];

export interface MenuBarEntry extends Omit<MenuEntryProps, "content"> {
  content?: ReactNode | (() => ReactNode);
}

export function MenuBar({ children, entries = menuEntries }: { children?: ReactNode; entries?: MenuBarEntry[] }) {
  const user = useStore(authStore);
  const [section, setSection] = useState<"home" | "edit" | "map">("map");
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(open => !open), []);
  const openButton = useBetween(
    "xs",
    "xl",
    <button type="button" className={classes.hamburger} onClick={toggle}>
      <Icon icon="list" />
    </button>,
  );

  const menuEntries = useMemo(() => {
    return entries.map(it => ({
      ...it,
      active: it.key === section,
      onClick: () => setSection(it.key),
    }));
  }, [entries, section]);

  const content = useMemo(() => {
    const content = menuEntries.find(it => it.active)?.content;
    if (typeof content === "function") return (content as any)();
    return content;
  }, [menuEntries]);

  const plainEntries = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return menuEntries.map(({ content, ...props }) => props);
  }, [menuEntries]);

  const userArea = useMemo(() => {
    if (user)
      return (
        <>
          <Popover
            placement="bottomRight"
            content={
              <>
                <Button danger onClick={authStore.logout}>
                  Logout
                </Button>
              </>
            }>
            <div className="mr-2 space-x-2 flex flex-row">
              <Avatar src={user.picture} />
              <div className="flex flex-col">
                <strong className="-mt-1.5">{user.name}</strong>
                <span className="-mt-1 text-sm">{user.email}</span>
              </div>
            </div>
          </Popover>
        </>
      );
    return (
      <Popover
        placement="bottomRight"
        content={
          <>
            <Button onClick={() => authStore.oauth("discord")}>Login mit Discord</Button>
          </>
        }>
        <Button>Login</Button>
      </Popover>
    );
  }, [user]);

  return (
    <Drawer
      content={
        <div className={classes.header}>
          {openButton}
          Nightwatch
          {userArea}
        </div>
      }
      static
      top>
      <Menu open={open} items={plainEntries}>
        {content ?? children}
      </Menu>
    </Drawer>
  );
}
