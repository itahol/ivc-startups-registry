'use client';
import { use } from 'react';
import { Person, PersonPosition } from '@/lib/model';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CurrentPositionsSection from './CurrentPositionsSection';
import PreviousPositionsSection from './PreviousPositionsSection';
import BackgroundSection from './BackgroundSection';

interface PersonDetailsClientProps {
  personPromise: Promise<Person | undefined>;
  positionsPromise: Promise<
    {
      companyID: string;
      positionTitle: string | null;
      positionEndDate: Date | null;
      companyName: string | null;
      companyCeasedDate: Date | null;
      companyType: string | null;
      companySubType: string | null;
      companyType2: string | null;
    }[]
  >;
}

function transformPositions(
  positions: {
    companyID: string;
    positionTitle: string | null;
    positionEndDate: Date | null;
    companyName: string | null;
    companyCeasedDate: Date | null;
    companyType: string | null;
    companySubType: string | null;
    companyType2: string | null;
  }[],
): { current: PersonPosition[]; previous: PersonPosition[] } {
  const current: PersonPosition[] = [];
  const previous: PersonPosition[] = [];

  for (const pos of positions) {
    const position: PersonPosition = {
      companyID: pos.companyID,
      companyName: pos.companyName,
      companyType: pos.companySubType,
      companyStatus: pos.companyCeasedDate ? null : 'Active',
      title: pos.positionTitle,
      isCurrent: !pos.positionEndDate,
    };

    if (position.isCurrent) {
      current.push(position);
    } else {
      previous.push(position);
    }
  }

  return { current, previous };
}

export default function PersonDetailsClient({ personPromise, positionsPromise }: PersonDetailsClientProps) {
  const person = use(personPromise);
  if (!person) {
    notFound();
  }

  const positionsData = use(positionsPromise);
  const { current, previous } = transformPositions(positionsData);

  return (
    <div className="space-y-6 text-[15px] leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Key Executive
          </Badge>
          {person.linkedInProfile && (
            <a
              href={person.linkedInProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              <Badge variant="outline" className="text-xs">
                LinkedIn
              </Badge>
            </a>
          )}
        </div>
      </header>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CurrentPositionsSection positions={current} />
          {person.cv && (
            <>
              <Separator />
              <BackgroundSection cv={person.cv} />
            </>
          )}
        </div>

        <div className="space-y-6">
          <PreviousPositionsSection positions={previous} />
        </div>
      </div>
    </div>
  );
}
