import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// True only on the client, after hydration. Used to avoid rendering
// localStorage-backed cart state during SSR.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
