'use client';
import { use } from 'react';
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
  console.dir(company);
  const techVerticals = company.techVerticals ?? [];
  const management = orderManagement(company.management || []);
  const websiteHref =
    company.Website && (company.Website.startsWith('http') ? company.Website : `https://${company.Website}`);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{company.Company_Name}</h1>
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

      <ItemGroup className="gap-6">
        <Item className="flex-col items-start">
          <ItemTitle>Overview</ItemTitle>
          <ItemContent className="mt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-medium mb-1">Stage</h2>
                <p className="text-muted-foreground text-sm">{company.Stage ?? '—'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium mb-1">Sector</h2>
                <p className="text-muted-foreground text-sm">{company.Sector ?? '—'}</p>
              </div>
            </div>
            {company.Company_Description && (
              <ItemDescription className="!line-clamp-none text-sm leading-snug">
                {company.Company_Description}
              </ItemDescription>
            )}
            {company.Technology && (
              <div>
                <h2 className="text-sm font-medium mb-1">Technology</h2>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-snug">{company.Technology}</p>
              </div>
            )}
          </ItemContent>
        </Item>

        <ItemSeparator />

        <Item className="flex-col items-start">
          <ItemTitle>Tech Verticals</ItemTitle>
          <ItemContent className="mt-2">
            {techVerticals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {techVerticals.map((tv) => (
                  <Badge key={tv.Tags_ID} variant="outline">
                    {tv.Tags_Name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No tech verticals listed.</p>
            )}
          </ItemContent>
        </Item>

        <ItemSeparator />

        <Item className="flex-col items-start w-full">
          <ItemTitle>Management</ItemTitle>
          <ItemContent className="mt-4 w-full">
            {management.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {management.map((m) => (
                    <TableRow key={m.Contact_ID || m.Contact_Name || Math.random()}>
                      <TableCell className="font-medium">{m.Contact_Name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{m.Position_Title || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">No management data available.</p>
            )}
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
