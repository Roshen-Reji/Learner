"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public routes that do not require the authenticated Sidebar wrapper
  const noSidebarRoutes = ["/", "/login", "/signup"];
  
  if (noSidebarRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Inject the Sidebar functionally above all protected Route scopes to prevent unmount jitter during navigation
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
