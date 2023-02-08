import clsx from "clsx";
import React, { HTMLProps, memo } from "react";
import { IconsId } from "src/renderer/icons";

export interface IconOptions extends HTMLProps<HTMLSpanElement> {
  icon: IconsId;
}
export const Icon = memo(function Icon({ icon, className, ...props }: IconOptions) {
  return <i className={clsx(`icons-${icon}`, className)} {...props} />;
});
