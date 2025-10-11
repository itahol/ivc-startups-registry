import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { QUERIES } from '@/lib/server/db/queries';
import CompanyDetailsClient from '@/components/companies/CompanyDetailsClient';
import { CompanyDetailsSkeleton } from '@/components/companies/CompanyDetailsSkeleton';

interface PageProps {
  params: Promise<{ companyId: string }> | { companyId: string };
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { companyId } = await params;

  const basePromise = QUERIES.getCompanyDetails({ companyId });
  const techVerticalsPromise = QUERIES.getCompanyTechVerticals({ companyId });
  const managementPromise = QUERIES.getCompanyManagement({ companyId });
  const boardPromise = QUERIES.getCompanyBoard({ companyId });
  const dealsPromise = QUERIES.getCompanyDeals({ companyId });
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-6">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
            <Suspense fallback={<CompanyDetailsSkeleton />}>
              <CompanyDetailsClient
                companyPromise={basePromise}
                techVerticalsPromise={techVerticalsPromise}
                managementPromise={managementPromise}
                boardPromise={boardPromise}
                dealsPromise={dealsPromise}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
