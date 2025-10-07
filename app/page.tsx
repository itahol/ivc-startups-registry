'use client';

import { Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-8 flex flex-col gap-8">
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the numbers</p>
      <a href="/sign-in">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">Sign in</button>
      </a>
      <a href="/sign-up">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">Sign up</button>
      </a>
    </div>
  );
}

function Content() {
  const companies = useQuery(api.companies.list, {
    limit: 10,
  });
  const addCompany = useMutation(api.myFunctions.createCompany);

  if (companies === undefined) {
    return <div className="mx-auto"></div>;
  }

  return (
    <div>
      <p>
        See the{' '}
        <Link href="/server" className="underline hover:no-underline">
          /server route
        </Link>{' '}
        for an example of loading data in a server component
      </p>
      <div className="flex flex-col">
        <p className="text-lg font-bold">Useful resources:</p>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Convex docs"
              description="Read comprehensive documentation for all Convex features."
              href="https://docs.convex.dev/home"
            />
            <ResourceCard
              title="Stack articles"
              description="Learn about best practices, use cases, and more from a growing
            collection of articles, videos, and walkthroughs."
              href="https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Templates"
              description="Browse our collection of templates to get started quickly."
              href="https://www.convex.dev/templates"
            />
            <ResourceCard
              title="Discord"
              description="Join our developer community to ask questions, trade tips & tricks,
            and show off your projects."
              href="https://www.convex.dev/community"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <a href={href} className="text-sm underline hover:no-underline">
        {title}
      </a>
      <p className="text-xs">{description}</p>
    </div>
  );
}
