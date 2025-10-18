'use client';

import Link from 'next/link';
import { UsersRoundIcon, MailIcon } from 'lucide-react';
import { Highlight, Snippet } from 'react-instantsearch';

interface ExecutiveRelation {
  companyID?: string;
  companyName?: string;
  personName?: string;
  title?: string;
  isCurrent?: boolean;
}

interface BoardRelation {
  companyID?: string;
  companyName?: string;
  personName?: string;
  boardName?: string;
  boardPosition?: string;
  otherPositions?: string;
}

interface PersonRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cv?: string;
  linkedInProfile?: string;
  executive?: ExecutiveRelation | ExecutiveRelation[];
  boardMember?: BoardRelation | BoardRelation[];
}

type HighlightField = {
  value: string;
  matchLevel: 'none' | 'partial' | 'full';
  matchedWords: string[];
  fullyHighlighted?: boolean;
};

type InstantSearchHit<T> = T & {
  objectID: string;
  _highlightResult?: Record<string, HighlightField>;
  _snippetResult?: Record<string, HighlightField>;
  __position: number;
  __queryID?: string;
};

export type PersonHit = InstantSearchHit<PersonRecord>;

const asArray = <T,>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const formatRoleLabels = (labels: string[]): string | null => {
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
  const [first, second, ...rest] = labels;
  return `${first} & ${second}${rest.length > 0 ? ` · +${rest.length}` : ''}`;
};

const summarizeRoles = (executives: ExecutiveRelation[], boards: BoardRelation[]): string[] => {
  const labels: string[] = [];
  if (executives.length > 0) labels.push('Key Executive');
  if (boards.length > 0) labels.push('Board Member');
  return labels;
};

const deriveBoardTitle = (board?: BoardRelation): string | undefined => {
  if (!board) return undefined;
  return board.boardPosition ?? board.otherPositions ?? board.boardName ?? undefined;
};

export function PersonPreviewCard({ hit }: { hit: PersonHit }) {
  const executives = asArray(hit.executive);
  const boards = asArray(hit.boardMember);
  const roleSummary = formatRoleLabels(summarizeRoles(executives, boards));

  const preferredExecutive = executives.find((exec) => exec.isCurrent) ?? executives[0];
  const preferredBoard = boards[0];

  const primaryCompanyId = preferredExecutive?.companyID ?? preferredBoard?.companyID ?? null;
  const primaryCompanyName = preferredExecutive?.companyName ?? preferredBoard?.companyName ?? null;
  const title = preferredExecutive?.title ?? deriveBoardTitle(preferredBoard) ?? null;
  const email = hit.email ?? null;

  return (
    <article className="group rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/60 focus-within:border-primary/60">
      <div className="flex gap-4">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UsersRoundIcon size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <Link
              href={`/people/${hit.id}`}
              className="inline-flex items-center gap-1 text-lg font-semibold leading-tight text-primary hover:underline focus-visible:underline"
            >
              <Highlight attribute="name" hit={hit} />
            </Link>
            {roleSummary ? <p className="text-sm text-muted-foreground">{roleSummary}</p> : null}
          </div>

          {title || primaryCompanyName ? (
            <p className="text-sm text-muted-foreground">
              {title ? <span className="font-medium text-foreground">{title}</span> : null}
              {title && primaryCompanyName ? <span className="mx-1 text-muted-foreground">|</span> : null}
              {primaryCompanyName ? (
                primaryCompanyId ? (
                  <Link
                    href={`/companies/${primaryCompanyId}`}
                    className="font-medium text-primary hover:underline focus-visible:underline"
                  >
                    {primaryCompanyName}
                  </Link>
                ) : (
                  <span className="font-medium text-primary">{primaryCompanyName}</span>
                )
              ) : null}
            </p>
          ) : null}

          {email ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <MailIcon size={14} aria-hidden="true" />
                E-mail
              </span>
              <span className="text-muted-foreground">|</span>
              <a href={`mailto:${email}`} className="text-primary hover:underline focus-visible:underline">
                {email}
              </a>
            </p>
          ) : null}

          {hit.cv ? (
            <p className="text-sm leading-snug text-muted-foreground line-clamp-3">
              <Snippet hit={hit} attribute="cv" />
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
