import React, { PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface ResponsiveOptions<Sizes extends Record<string, number>> {
  sizes?: Sizes;
}

export const TailwindSizes = {
  base: 0,
  xs: 640,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1536,
};

export type Primitive = string | number | symbol | boolean | undefined | null;

export type UseResponsive<Sizes extends Record<string, number>> = <Options>(
  options?: UseResponsiveOptions<Sizes, Options>,
) => UseResponsiveResult<Sizes, Options>;
export type UseResponsiveResult<Sizes extends Record<string, number>, Options = never> = Options extends never
  ? { size: keyof Sizes }
  : {
      size: keyof Sizes;
      props: Options extends Primitive ? Options : Partial<Options>;
    };
export type UseResponsiveOptions<Sizes extends Record<string, number>, Options> = {
  [Key in keyof Sizes]?: Options extends Primitive ? Options : Partial<Options>;
};
export type UseAbove<Sizes extends Record<string, number>> = <T, O = T | undefined>(
  point: keyof Sizes,
  then: T,
  otherwise?: O,
) => T | O;
export type UseBelow<Sizes extends Record<string, number>> = <T, O = T | undefined>(
  point: keyof Sizes,
  then: T,
  otherwise?: O,
) => T | O;

export type UseBetween<Sizes extends Record<string, number>> = <T, O = T | undefined>(
  lower: keyof Sizes,
  higher: keyof Sizes,
  then: T,
  otherwise?: O,
) => T | O;
export type ResponsiveProvider = (props: PropsWithChildren<{ ref?: RefObject<HTMLElement> }>) => JSX.Element;
export interface ResponsiveHooks<Sizes extends Record<string, number>> {
  sizes: Sizes;
  useResponsive: UseResponsive<Sizes>;
  useAbove: UseAbove<Sizes>;
  useBelow: UseBelow<Sizes>;
  useBetween: UseBetween<Sizes>;
  ResponsiveProvider: ResponsiveProvider;
}

export function createResponsiveHooks<Sizes extends Record<string, number> = typeof TailwindSizes>(
  options?: ResponsiveOptions<Sizes>,
): ResponsiveHooks<Sizes> {
  const { sizes: sizesOrig = { ...(TailwindSizes as unknown as Sizes) } } = options ?? {};
  const sizes: Sizes = { ...sizesOrig, _: 0 };
  const ordered = Object.entries(sizes).sort(([, widthA], [, widthB]) => widthB - widthA) as [keyof Sizes, number][];
  const [zero, smallest] = ordered.slice().reverse();

  function currentSize(ref?: RefObject<HTMLElement>): keyof Sizes {
    const width = ref?.current?.clientWidth ?? window.innerWidth;
    return (ordered.find(([, lowerBounds]) => {
      if (lowerBounds <= width) return true;
    }) ?? zero)[0];
  }

  const ResponsiveContext = React.createContext(currentSize());

  const ResponsiveProvider: ResponsiveProvider = ({ children, ref }) => {
    const [size, setSize] = useState(currentSize(ref));
    const handleResize = useCallback(() => {
      const current = currentSize(ref);
      if (current !== size) setSize(current);
    }, [ref, size]);
    useEffect(() => {
      if (ref?.current) {
        const observer = new ResizeObserver(handleResize);
        observer.observe(ref.current);
        return () => observer.disconnect();
      } else {
        window.addEventListener("resize", handleResize, { passive: true });
        return () => window.removeEventListener("resize", handleResize);
      }
    }, [ref, handleResize]);
    return <ResponsiveContext.Provider value={size}>{children}</ResponsiveContext.Provider>;
  };

  const useSize = (unsafe?: boolean): keyof Sizes => {
    const sizeUnsafe = useContext(ResponsiveContext);
    return unsafe ? sizeUnsafe : sizeUnsafe === "_" ? smallest[0] : sizeUnsafe;
  };

  const useResponsive: UseResponsive<Sizes> = options => {
    const size = useSize();
    const props = useMemo(() => {
      if (!options) return undefined;
      const copy = ordered.slice();
      // Check higher to lower (break down), then lower to higher (break up)
      for (let i = 0; i < 2; i++) {
        let found = false;
        for (const [s] of copy) {
          if (s === size) found = true;
          if (options[s] && found) return options[s];
        }
        copy.reverse();
      }
      throw new RangeError(
        `useResponsive: no size matching definitions found in options. Valid sizes: ${ordered
          .map(([size]) => size)
          .join(" | ")}`,
      );
    }, [size, options]);
    return { size, props } as never;
  };

  const useAbove: UseAbove<Sizes> = (point, then, otherwise) => {
    // Allow for useAbove with smallest size
    const size = useSize(true);
    return (sizes[point] <= sizes[size] ? then : otherwise) as never;
  };

  const useBelow: UseBelow<Sizes> = (point, then, otherwise) => {
    const size = useSize();
    return (sizes[point] > sizes[size] ? then : otherwise) as never;
  };

  const useBetween: UseBetween<Sizes> = (lower, higher, then, otherwise) => {
    return useAbove(lower, useBelow(higher, then, otherwise), otherwise);
  };

  return {
    sizes,
    useResponsive,
    useAbove,
    useBelow,
    useBetween,
    ResponsiveProvider,
  };
}
