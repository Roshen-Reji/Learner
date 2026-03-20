"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-white !text-gray-900 !shadow-lg !rounded-xl !border !border-gray-100",
          duration: 3000,
        }}
      />
    </SessionProvider>
  );
}
