'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!hydrated) {
    return <div className="min-h-screen" />;
  }

  return <>{children}</>;
}
