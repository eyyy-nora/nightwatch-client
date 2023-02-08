import { stringHash } from "src/util/strings";
import { angleDistance, clamp } from "./numbers";
export type Color = [r: number, g: number, b: number];

export function colorToNumber([r, g, b]: Color): number {
  return (r << 16) | (g << 8) | b;
}

export function numberToColor(color: number): Color {
  return [color >> 16, (color >> 8) & 0xff, color & 0xff];
}

export function lighten(color: Color, value: number): Color {
  return color.map(channel => clamp(channel * (value + 1), 0, 255) | 0) as Color;
}

export function darken(color: Color, value: number): Color {
  return color.map(channel => clamp(channel * (1 - value), 0, 255) | 0) as Color;
}

export function numberToRgba(color: number, alpha: number = 1) {
  return `rgba(${numberToColor(color).join(", ")}, ${alpha})`;
}

export function normalizedColor(angle: number, saturation = 40, lighting = 50) {
  const mod = 1 - angleDistance(angle, 250) / 180;
  const strength = (saturation / 100) * 40;
  lighting = lighting * ((100 - strength) / 100) + mod * strength;
  return `hsl(${angle.toFixed(4)}, ${saturation.toFixed(4)}%, ${lighting.toFixed(4)}%)`;
}

export function randomColor(saturation = 40, lighting = 50, seed: number = Math.random()) {
  return normalizedColor(seed * 360, saturation, lighting);
}

export function colorForString(str: string, saturation = 40, lighting = 50) {
  return normalizedColor(stringHash(str), saturation, lighting);
}
