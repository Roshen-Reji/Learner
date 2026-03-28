"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

export default function Providers({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!bg-white dark:!bg-[#1A1A1A] !text-[#0B1B3D] dark:!text-white !shadow-lg !rounded-xl !border !border-gray-100 dark:!border-[#2A2A2A]",
            duration: 3000,
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
