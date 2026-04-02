import { Suspense } from "react";

import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-neutral-500">Loading…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
