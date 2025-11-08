import Navbar from '@/components/Navbar';
import { Metadata } from 'next';
import { HeroClient } from '@/app/_components/HeroClient';
import { StatsSection } from '@/app/_components/StatsSection';

export const metadata: Metadata = {
  title: 'IVC',
  description: 'Tap into the digital ecosystem of Israeli high‑tech: companies, investment firms, people, and funds.',
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroClient />
        <StatsSection />
      </main>
    </>
  );
}
