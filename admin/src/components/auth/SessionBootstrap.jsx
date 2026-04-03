"use client";

import { useEffect, useRef } from "react";

import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

export default function SessionBootstrap() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const bootstrap = async () => {
      const store = useAuthStore.getState();
      const { token, user } = store.hydrateFromStorage();

      // Sync axios header immediately from persisted token.
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        delete api.defaults.headers.common.Authorization;
      }

      // Optionally verify token with backend so stale tokens don't keep user "logged in".
      if (token) {
        try {
          const res = await api.get("/users/me");
          const me = res?.data;
          if (me?._id) {
            store.setUser({
              _id: me._id,
              name: me.name,
              email: me.email,
              role: me.role,
            });
          } else if (!user) {
            store.logout();
          }
        } catch {
          store.logout();
        }
      }

      useAuthStore.getState().setLoading(false);
    };

    bootstrap();
  }, []);

  return null;
}

