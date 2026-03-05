import React, { Suspense, lazy } from 'react';

const VirtualScrollScene = lazy(() => import('../components/VirtualScrollScene'));

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#06060c]" />}>
      <VirtualScrollScene />
    </Suspense>
  );
}
