import Link from "next/link";

import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
