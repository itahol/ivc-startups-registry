'use client';

import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home({ preloaded }: { preloaded: Preloaded<typeof api.companies.list> }) {
  const data = usePreloadedQuery(preloaded);
  const createCompany = useMutation(api.myFunctions.createCompany);
  return (
    <>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Reactive client-loaded data (using server data during hydration)</h2>
        <code>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </div>
      <button
        className="bg-foreground text-background px-4 py-2 rounded-md mx-auto"
        onClick={() => {
          void createCompany({ name: `Cool company - ${Math.random() * 100}` });
        }}
      >
        Add a random number
      </button>
    </>
  );
}
