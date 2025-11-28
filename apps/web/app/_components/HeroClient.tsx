"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function HeroClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleTryItNow = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search page with the search query
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const handleAdvancedSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to search page with the search query if there is one
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 md:px-8 py-16 md:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="flex flex-col items-start gap-6 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            NEW
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            AI-based Search (Beta)
          </span>
        </div>
        <h1
          id="hero-heading"
          className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight"
        >
          Tap into the Digital Ecosystem of the Israeli High‑Tech
        </h1>
        <p className="text-lg text-muted-foreground">
          Data. Insights. Reports.
        </p>
        <form
          className="w-full"
          role="search"
          aria-label="Site search"
          onSubmit={handleTryItNow}
          noValidate
        >
          <label htmlFor="hero-search" className="sr-only">
            Search companies
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              id="hero-search"
              name="q"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find Israeli Tech Companies with Free Text"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Try it Now
              </button>
              <Link
                href="#"
                onClick={handleAdvancedSearch}
                className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Advanced Search
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
