"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Disabled custom JS scrolling bounds to prioritize raw 60FPS mobile touch capability natively natively
  return <>{children}</>;
}
