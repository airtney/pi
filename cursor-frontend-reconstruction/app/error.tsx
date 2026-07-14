"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Reconstruction of module 641852 (App Router `error.tsx`). The compiled
 * version wrapped everything in `useMemoCache`; the behaviour is: log the
 * error on mount, then render a "Something went wrong" panel with a home link
 * and a reset button.
 */
export default function Error({
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
    <main id="main">
      <section className="section bg-theme-bg text-theme-text">
        <div className="container">
          <div className="text-left">
            <h1 className="type-md text-balance">Something went wrong</h1>
            <div className="flex justify-start mb-v1">
              <div className="type-md text-theme-text-sec stack text-balance">
                <p>We encountered an unexpected error. Please try again.</p>
              </div>
            </div>
            <div className="gap-x-g1 flex items-center justify-start">
              <Link className="btn" href="/">
                Take me home
              </Link>
              <button onClick={reset} type="button" className="btn btn--secondary">
                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
