"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HeartbeatLoader message="AUTHENTICATING..." />
      </div>
    );
  }

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
