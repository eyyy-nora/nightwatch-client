import clsx from "clsx";
import React, { ReactNode } from "react";
import classes from "./busy-overlay.module.css";

export interface BusyOverlayProps {
  busy: boolean;
  children: ReactNode;
  content?: ReactNode;
}

export function BusyOverlay({ busy, children, content }: BusyOverlayProps) {
  return (
    <div className={clsx({ [classes.busyOverlay]: true, busy })}>
      {children}
      <div className={clsx({ [classes.busyOverlayContent]: true, busy })}>{content ?? "Loading..."}</div>
    </div>
  );
}
