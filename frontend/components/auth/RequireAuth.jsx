"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Skeleton from "@/components/ui/Skeleton";
import useAuthStore from "@/store/authStore";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const sessionReady = useAuthStore((s) => s.sessionReady);

  useEffect(() => {
    if (!sessionReady) return;
    if (!accessToken) {
      router.replace("/login");
    }
  }, [sessionReady, accessToken, router]);

  if (!sessionReady) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-24">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-md py-24 text-center text-sm text-neutral-500">
        Redirecting to sign in…
      </div>
    );
  }

  return children;
}
