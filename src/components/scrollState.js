// Shared virtual scroll state — written by VirtualScrollScene, read by 3D components
export const scrollState = { progress: 0 };

export function useScrollProgress() {
  return scrollState;
}
