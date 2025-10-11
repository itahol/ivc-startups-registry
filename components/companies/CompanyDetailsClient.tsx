'use client';
import { use, useState } from 'react';
import { Item, ItemGroup, ItemTitle, ItemContent, ItemDescription, ItemSeparator } from '@/components/ui/item';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CompanyBoardMember, CompanyExecutive, CompanyFullDetails, CompanyFundingDeal } from '../../lib/model';
import CompanyFundingRounds from '@/components/companies/CompanyFundingRounds';
import { notFound } from 'next/navigation';

const TECH_PREVIEW = 8;
const MANAGEMENT_PREVIEW = 5;
const BOARD_PREVIEW = 5;

export default function CompanyDetailsClient(props: {
  companyPromise: Promise<CompanyFullDetails | undefined>;
  techVerticalsPromise: Promise<{ tagID: string | null; tagName: string | null }[]>;
  managementPromise: Promise<CompanyExecutive[]>;
  boardPromise: Promise<CompanyBoardMember[]>;
  dealsPromise: Promise<CompanyFundingDeal[]>;
}) {
  const { companyPromise, managementPromise, techVerticalsPromise, boardPromise, dealsPromise } = props;
  const company = use(companyPromise);
  if (!company) {
    notFound();
  }

  const techVerticals = use(techVerticalsPromise);
  const management = orderManagement(use(managementPromise));
  const websiteHref =
    company.website && (company.website.startsWith('http') ? company.website : `https://${company.website}`);

  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllManagement, setShowAllMgmt] = useState(false);
  const [showAllBoard, setShowAllBoard] = useState(false);
  const techToShow = showAllTech ? techVerticals : techVerticals.slice(0, TECH_PREVIEW);
  const managementToShow = showAllManagement ? management : management.slice(0, MANAGEMENT_PREVIEW);
  const orderedBoard = orderBoard(use(boardPromise) || []);
  const boardToShow = showAllBoard ? orderedBoard : orderedBoard.slice(0, BOARD_PREVIEW);

  return (
    <div className="space-y-6 text-[15px] leading-relaxed">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{company.companyName}</h1>
        {websiteHref && (
          <p className="text-muted-foreground text-sm">
            <a
              href={websiteHref}
              className="hover:underline focus-visible:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {new URL(websiteHref).hostname.replace(/^www\./, '')}
            </a>
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <ItemGroup className="gap-4">
            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">About</ItemTitle>
              <ItemContent className="mt-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3 text-[13px]">
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Stage</h2>
                    <p>{company.stage ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Sector</h2>
                    <p>{company.sector ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Employees
                    </h2>
                    <p>{company.employees ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Israel Employees
                    </h2>
                    <p>{company.israeliEmployees ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Reg #</h2>
                    <p>{company.regNumber ?? '—'}</p>
                  </div>
                </div>
                {company.companyDescription && (
                  <ItemDescription className="!line-clamp-none text-[14px] leading-snug">
                    {company.companyDescription}
                  </ItemDescription>
                )}
                {company.technology && (
                  <div className="text-[14px]">
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Technology
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-snug">{company.technology}</p>
                  </div>
                )}
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">Tech Verticals</ItemTitle>
              <ItemContent className="mt-2 space-y-3">
                {techVerticals.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {techToShow.map((tv) => (
                        <Badge key={tv.tagID} variant="outline" className="text-[12px] py-1 px-2">
                          {tv.tagName}
                        </Badge>
                      ))}
                    </div>
                    {techVerticals.length > TECH_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllTech((v: boolean) => !v)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                        aria-expanded={showAllTech}
                      >
                        {showAllTech ? 'Show less' : `Show all (${techVerticals.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No tech verticals listed.</p>
                )}
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <CompanyFundingRounds deals={use(dealsPromise) || []} />
          {/* Inserted feature parity financial rounds section */}
          <ItemGroup className="gap-4">
            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">Management</ItemTitle>
              <ItemContent className="mt-3 w-full space-y-3">
                {management.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2 text-xs uppercase tracking-wide">Name</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide">Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managementToShow.map((managementPosition, idx) => (
                          <TableRow key={idx} className="text-[13px]">
                            <TableCell className="font-medium">{managementPosition.contactName || '—'}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {managementPosition.positionTitle || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {management.length > MANAGEMENT_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllMgmt((v: boolean) => !v)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                        aria-expanded={showAllManagement}
                      >
                        {showAllManagement ? 'Show fewer' : `Show all (${management.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No management data available.</p>
                )}
              </ItemContent>
            </Item>

            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">Board</ItemTitle>
              <ItemContent className="mt-3 w-full space-y-3">
                {orderedBoard.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2 text-xs uppercase tracking-wide">Name</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide">Title</TableHead>
                          <TableHead className="text-xs uppercase tracking-wide">Affiliation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {boardToShow.map((boardMember, idx) => {
                          return (
                            <TableRow key={idx} className="text-[13px]">
                              <TableCell className="font-medium">{boardMember.boardName || '—'}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {boardMember.boardPosition || '—'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {boardMember.otherPositions || '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    {orderedBoard.length > BOARD_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllBoard((v: boolean) => !v)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                        aria-expanded={showAllBoard}
                      >
                        {showAllBoard ? 'Show fewer' : `Show all (${orderedBoard.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No board data available.</p>
                )}
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      </div>
    </div>
  );
}

function orderManagement(list: CompanyExecutive[]) {
  const weight = (role: string | null) => {
    if (!role) return 100;
    const r = role.toLowerCase();
    if (r.startsWith('ceo')) return 0;
    if (r.startsWith('cto')) return 1;
    if (/^(chief|cfo|coo|cmo|cso|cpo)/.test(r)) return 2;
    if (/vp|vice president/.test(r)) return 3;
    return 10;
  };
  return [...list].sort((a, b) => weight(a.positionTitle) - weight(b.positionTitle));
}

function orderBoard(list: CompanyBoardMember[]) {
  const weight = (title: string | null) => {
    if (!title) return 99;
    const t = title.toLowerCase();
    if (t.includes('chairman') || t.includes('chairperson')) return 0;
    if (t.includes('board member')) return 1;
    if (t.includes('observer')) return 2;
    return 99;
  };
  return [...list].sort((a, b) => {
    const w = weight(a.boardPosition) - weight(b.boardPosition);
    if (w !== 0) return w;
    const an = a.boardName || '';
    const bn = b.boardName || '';
    return an.localeCompare(bn);
  });
}
