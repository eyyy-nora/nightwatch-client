import React, { memo } from "react";
import { IconsId } from "src/renderer/icons";

export interface IconOptions {
  icon: IconsId;
}
export const Icon = memo(function Icon({ icon }: IconOptions) {
  return <i className={`icons-${icon}`} />;
});
