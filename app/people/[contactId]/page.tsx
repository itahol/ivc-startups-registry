import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { QUERIES } from "@/lib/server/db/queries";
import PersonDetailsClient from "./_components/PersonDetailsClient";
import { PersonDetailsSkeleton } from "./_components/PersonDetailsSkeleton";

interface PageProps {
  params: Promise<{ contactId: string }> | { contactId: string };
}

export default async function PersonDetailsPage({ params }: PageProps) {
  const { contactId } = await params;

  const personPromise = QUERIES.getPersonDetails({ contactId });
  const positionsPromise = QUERIES.getPersonPositions({ contactId });

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-6">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
            <Suspense fallback={<PersonDetailsSkeleton />}>
              <PersonDetailsClient
                personPromise={personPromise}
                positionsPromise={positionsPromise}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
