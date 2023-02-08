import { Ref, useEffect, useRef, useState } from "react";
import { sleep } from "src/util/sleep";

export function resizeElement(el: HTMLElement | undefined | null, { width = false, height = false } = {}) {
  if (!el) return;
  if (height) {
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }
  if (width) {
    el.style.width = "0px";
    el.style.width = el.scrollWidth + "px";
  }
}

export function growElement(
  el: HTMLElement,
  { width = false, height = false, events = ["input", "change", "keypress"] } = {},
) {
  function handler(ev: Event) {
    const el = ev.currentTarget as HTMLElement;
    resizeElement(el, { width, height });
    sleep(1).then(() => resizeElement(el, { width, height }));
  }

  resizeElement(el, { width, height });

  for (const event of events) el.addEventListener(event, handler);

  return function () {
    for (const event of events) el.removeEventListener(event, handler);
  };
}

export function useGrowingElement<EL extends HTMLElement>({
  width = false,
  height = false,
  events = ["input", "change", "keypress"],
  deps = [] as unknown[],
} = {}) {
  const ref = useRef<EL>(null);

  useEffect(() => {
    return growElement(ref.current!, { width, height, events });
  }, [width, height, ...deps]);

  return ref;
}
