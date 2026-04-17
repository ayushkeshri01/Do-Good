"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">500</h1>
      <h2 className="text-2xl font-semibold">Internal Server Error</h2>
      <p className="text-muted-foreground">
        Something went wrong on our end.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
