"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import useAuth from "@/hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <RequireAuth>
        <div className="mx-auto w-full max-w-md px-4 py-16">
          <div className="rounded-xl border border-neutral-100 bg-white p-8 shadow-sm">
            <h1 className="font-display text-2xl font-semibold text-primary">Your account</h1>
            <p className="mt-4 text-sm text-neutral-700">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
        </div>
      </RequireAuth>
    </PageWrapper>
  );
}
