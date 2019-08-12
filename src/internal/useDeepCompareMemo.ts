import { useRef } from "react";

import { isDeepEqual } from "./DataUtils";

export function useDeepCompareMemo<T>(
  factory: () => T,
  inputs: any,
): T {
  const memoRef = useRef(factory());
  const inputsRef = useRef(inputs);

  if (!isDeepEqual(inputsRef.current, inputs)) {
    inputsRef.current = inputs;
    memoRef.current = factory();
  }

  return memoRef.current;
}
