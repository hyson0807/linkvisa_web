'use client';

import { useState, useEffect } from 'react';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      {!hydrated && <style>{`[data-store-dependent] { visibility: hidden; }`}</style>}
      {children}
    </>
  );
}
