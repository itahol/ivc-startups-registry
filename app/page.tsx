'use client';

import { Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import Link from 'next/link';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import type { User } from '@workos-inc/node';
import { CompanyCard } from '../components/ui/company-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Convex + Next.js + WorkOS
        {user && <UserMenu user={user} onSignOut={signOut} />}
      </header>
      <main className="p-8 flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">Convex + Next.js + WorkOS</h1>
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
      <div className="flex flex-col gap-8 max-w-lg mx-auto">
        <p>Welcome {'Anonymous'}!</p>
        <p>
          Click the button below and open this page in another window - this data is persisted in the Convex cloud
          database!
        </p>
        <p>
          <button
            className="bg-foreground text-background text-sm px-4 py-2 rounded-md"
            onClick={() => {
              void addCompany({ name: `Cool company - ${Math.random() * 100}` });
            }}
          >
            Add a random number
          </button>
        </p>
      </div>
      <div className=" grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {companies?.length === 0
          ? 'Click the button!'
          : companies?.map((company) => {
              const { name, description, yearEstablished, techVerticals } = company;
              const websiteUrl = company.websiteUrl ? new URL(company.websiteUrl) : undefined;
              const tags = techVerticals.map((tv) => (
                <Badge variant={'outline'} key={tv._id}>
                  {tv.name}
                </Badge>
              ));
              return (
                <Card key={company._id}>
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    {websiteUrl ? (
                      <CardDescription>
                        <a href={websiteUrl.href} target="_blank" rel="noopener noreferrer">
                          {websiteUrl.hostname}
                        </a>
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    {techVerticals.length > 0 ? tags : null}
                    <p>{description}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>
      <p>
        Edit{' '}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          convex/myFunctions.ts
        </code>{' '}
        to change your backend
      </p>
      <p>
        Edit{' '}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          app/page.tsx
        </code>{' '}
        to change your frontend
      </p>
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

function UserMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.email}</span>
      <button onClick={onSignOut} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
        Sign out
      </button>
    </div>
  );
}
