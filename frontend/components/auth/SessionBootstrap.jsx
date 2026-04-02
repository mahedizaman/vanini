"use client";

import { useEffect, useRef } from "react";

import useAuthStore from "@/store/authStore";
import api from "@/utils/axios";

/**
 * Restores accessToken from httpOnly refresh cookie on full page load (Zustand is memory-only).
 */
export default function SessionBootstrap() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const bootstrap = async () => {
      const { accessToken, setAccessToken, setUser, setSessionReady } = useAuthStore.getState();
      try {
        if (accessToken) return;

        try {
          const { data } = await api.post("/auth/refresh-token");
          if (!data?.accessToken) return;

          setAccessToken(data.accessToken);

          try {
            const { data: user } = await api.get("/users/me");
            if (user?._id) {
              setUser({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              });
            }
          } catch {
            // profile optional; token is enough for API calls
          }
        } catch {
          // no valid refresh cookie
        }
      } finally {
        setSessionReady(true);
      }
    };

    bootstrap();
  }, []);

  return null;
}
