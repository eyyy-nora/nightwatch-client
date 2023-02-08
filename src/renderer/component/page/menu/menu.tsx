import clsx from "clsx";
import React, { HTMLProps, ReactNode } from "react";
import { Drawer, DrawerProps } from "src/renderer/component/layout/drawer/drawer";
import { Icon } from "src/renderer/component/typography/icon";
import { useResponsive } from "src/renderer/context/tailwind-context";
import { IconsId } from "src/renderer/icons";
import classes from "./menu.module.css";

export interface MatchLinkProps {
  match: string;
  exact?: boolean;
}

export interface MenuEntryProps extends HTMLProps<HTMLDivElement> {
  icon: IconsId;
  label: string;
  key?: any;
  active?: boolean;
}

export function MenuEntry(props: MenuEntryProps): MenuEntry {
  return {
    button: <MenuEntryButton {...props} />,
    label: <MenuEntryLabel {...props} />,
  };
}

export interface MenuEntry {
  button: ReactNode;
  label: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuEntryButton({ icon, label, active, className, children, ...props }: MenuEntryProps) {
  const cls = clsx({
    [className ?? ""]: !!className,
    [classes.button]: true,
    [classes.active]: active,
  });

  return (
    <div {...props} className={cls}>
      <Icon icon={icon} className={classes.icon} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuEntryLabel({ icon, label, active, className, children, ...props }: MenuEntryProps) {
  const cls = clsx({
    [className ?? ""]: !!className,
    [classes.label]: true,
    [classes.active]: active,
  });

  return (
    <div {...props} className={cls}>
      <span className={classes.label}>{label}</span>
    </div>
  );
}

export interface MenuProps {
  entries?: MenuEntry[];
  items?: MenuEntryProps[];
  open?: boolean;
  children?: ReactNode;
}

export function Menu({ entries = [], items = [], open, children }: MenuProps) {
  const { props: iconBarProps } = useResponsive<DrawerProps>({
    base: { bottom: true, className: clsx([classes.bottom, classes.menu]), open: true, static: true },
    xs: { left: true, className: classes.menu, open: true, static: true },
  });

  const { props: menuBarProps } = useResponsive<DrawerProps>({
    base: { open: false },
    xs: { open },
    xl: { static: true, open },
  });

  const { labels, buttons } = items
    .map(MenuEntry)
    .concat(entries)
    .reduce(
      (all: { buttons: ReactNode[]; labels: ReactNode[] }, item: MenuEntry) => {
        all.buttons.push(item.button);
        all.labels.push(item.label);
        return all;
      },
      { buttons: [] as ReactNode[], labels: [] as ReactNode[] },
    );

  return (
    <Drawer {...iconBarProps} content={<div className={classes.buttons}>{buttons}</div>}>
      <Drawer {...menuBarProps} content={<div className={classes.labels}>{labels}</div>}>
        {children}
      </Drawer>
    </Drawer>
  );
}
