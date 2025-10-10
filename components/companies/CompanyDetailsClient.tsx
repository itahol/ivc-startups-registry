'use client';
import { use, useState } from 'react';
import { Item, ItemGroup, ItemTitle, ItemContent, ItemDescription, ItemSeparator } from '@/components/ui/item';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ManagementPerson {
  Contact_ID: string | null;
  Contact_Name: string | null;
  Position_Title: string | null;
}

interface CompanyDetailsData {
  Company_Name: string | null;
  Short_Name: string | null;
  Website: string | null;
  Sector: string | null;
  Stage: string | null;
  Company_Description: string | null;
  Technology: string | null; // CSV? Example field; we will show raw
  techVerticals: { Tags_ID: string; Tags_Name: string }[];
  management: ManagementPerson[];
  Employees: number | null;
  Israeli_Employees: number | null;
  Reg_Number: string | null;
}

function orderManagement(list: ManagementPerson[]) {
  const weight = (role: string | null) => {
    if (!role) return 100;
    const r = role.toLowerCase();
    if (r.startsWith('ceo')) return 0;
    if (r.startsWith('cto')) return 1;
    if (/^(chief|cfo|coo|cmo|cso|cpo)/.test(r)) return 2;
    if (/vp|vice president/.test(r)) return 3;
    return 10;
  };
  return [...list].sort((a, b) => weight(a.Position_Title) - weight(b.Position_Title));
}

export default function CompanyDetailsClient({ companyPromise }: { companyPromise: Promise<CompanyDetailsData> }) {
  const company = use(companyPromise);

  const techVerticals = company.techVerticals ?? [];
  const management = orderManagement(company.management || []);
  const websiteHref =
    company.Website && (company.Website.startsWith('http') ? company.Website : `https://${company.Website}`);

  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllMgmt, setShowAllMgmt] = useState(false);
  const TECH_PREVIEW = 8;
  const MGMT_PREVIEW = 5;
  const techToShow = showAllTech ? techVerticals : techVerticals.slice(0, TECH_PREVIEW);
  const mgmtToShow = showAllMgmt ? management : management.slice(0, MGMT_PREVIEW);

  return (
    <div className="space-y-6 text-[15px] leading-relaxed">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{company.Company_Name}</h1>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <ItemGroup className="gap-4">
            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">About</ItemTitle>
              <ItemContent className="mt-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3 text-[13px]">
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Stage</h2>
                    <p>{company.Stage ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Sector</h2>
                    <p>{company.Sector ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Employees
                    </h2>
                    <p>{company.Employees ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Israel Employees
                    </h2>
                    <p>{company.Israeli_Employees ?? '—'}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">Reg #</h2>
                    <p>{company.Reg_Number ?? '—'}</p>
                  </div>
                </div>
                {company.Company_Description && (
                  <ItemDescription className="!line-clamp-none text-[14px] leading-snug">
                    {company.Company_Description}
                  </ItemDescription>
                )}
                {company.Technology && (
                  <div className="text-[14px]">
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Technology
                    </h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-snug">{company.Technology}</p>
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
                        <Badge key={tv.Tags_ID} variant="outline" className="text-[12px] py-1 px-2">
                          {tv.Tags_Name}
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
        <div className="space-y-6">
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
                        {mgmtToShow.map((m) => (
                          <TableRow key={m.Contact_ID || m.Contact_Name || Math.random()} className="text-[13px]">
                            <TableCell className="font-medium">{m.Contact_Name || '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{m.Position_Title || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {management.length > MGMT_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllMgmt((v: boolean) => !v)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                        aria-expanded={showAllMgmt}
                      >
                        {showAllMgmt ? 'Show fewer' : `Show all (${management.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No management data available.</p>
                )}
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>
      </div>
    </div>
  );
}
