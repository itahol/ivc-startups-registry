import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { QUERIES } from '@/lib/server/db/queries';
import CompanyDetailsClient from '@/components/companies/CompanyDetailsClient';
import { CompanyDetailsSkeleton } from '@/components/companies/CompanyDetailsSkeleton';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ companyId: string }> | { companyId: string };
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const resolved = await params;
  const companyId: string = resolved.companyId;

  const companyPromise = QUERIES.getCompanyDetails({ companyId });

  // We cannot await here for streaming; instead we create a small proxy promise that
  // lets us detect not-found and throw early (still within suspense boundary).
  const guardedPromise = companyPromise.then((data) => {
    if (!data) {
      notFound();
    }
    return data;
  });

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-6">
          <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
            <Suspense fallback={<CompanyDetailsSkeleton />}>
              <CompanyDetailsClient companyPromise={guardedPromise} />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
