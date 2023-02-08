import clsx from "clsx";
import React, { memo, ReactNode } from "react";
import classes from "./drawer.module.css";

export interface DrawerProps {
  open?: boolean;
  static?: boolean;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  content?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Drawer = memo(function Drawer({
  children,
  content,
  open,
  side,
  top = side === "top",
  right = side === "right",
  bottom = side === "bottom",
  left = side === "left" || (!top && !right && !bottom),
  static: static_,
  className,
}: DrawerProps): JSX.Element {
  const flags = clsx(
    {
      [classes.top]: top,
      [classes.left]: left,
      [classes.bottom]: bottom,
      [classes.right]: right,
      [classes.open]: !static_ && open,
      [classes.static]: static_,
    },
    className,
  );

  return (
    <div className={clsx(classes.container, flags)}>
      {content && <aside className={clsx(classes.drawer, flags)}>{content}</aside>}
      <section className={classes.body}>{children}</section>
    </div>
  );
});
