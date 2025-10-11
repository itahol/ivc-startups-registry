'use client';
import { use, useState, useMemo } from 'react';
import { Item, ItemTitle, ItemContent } from '@/components/ui/item';
import { CompanyContactInfo, CompanyPrimaryContactInfo } from '@/lib/model';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface ContactInfoData {
  primaryContactInfo?: CompanyPrimaryContactInfo;
  branchesContactInfo: CompanyContactInfo[];
}

export default function ContactInfoSection({ contactInfoPromise }: { contactInfoPromise: Promise<ContactInfoData> }) {
  const { primaryContactInfo, branchesContactInfo } = use(contactInfoPromise);

  // Separate main branch (type === 'Main') and normal branches
  const mainBranch = branchesContactInfo.find((b) => (b.type || '').toLowerCase() === 'main');
  const branchAddresses = branchesContactInfo.filter((b) => (b.type || '').toLowerCase() !== 'main');

  // Group branches by country (excluding main)
  const groupedBranches = useMemo(() => {
    const map = new Map<string, CompanyContactInfo[]>();
    for (const b of branchAddresses) {
      const key = (b.country || 'Unknown').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    // sort branches within a country by city
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
    }
    // return array sorted by country name
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [branchAddresses]);

  // Build list of branch identifiers for expansion management
  type BranchKey = string; // country:index or 'main'
  const allKeys: BranchKey[] = [
    ...(mainBranch ? ['main'] : []),
    ...groupedBranches.flatMap(([country, arr]) => arr.map((_, i) => `${country}:${i}`)),
  ];
  const [expanded, setExpanded] = useState<Set<BranchKey>>(new Set());
  const allExpanded = expanded.size === allKeys.length && allKeys.length > 0;

  function toggle(key: BranchKey) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  }
  function expandAll() {
    setExpanded(new Set(allKeys));
  }
  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold flex items-center gap-4">
        <span>Contact Info</span>
        {allKeys.length > 0 && (
          <button
            type="button"
            onClick={() => (allExpanded ? collapseAll() : expandAll())}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </ItemTitle>
      <ItemContent className="mt-3 w-full space-y-4">
        {mainBranch && (
          <BranchPanel
            isMain
            expanded={expanded.has('main')}
            onToggle={() => toggle('main')}
            branch={mainBranch}
            primaryContactInfo={primaryContactInfo}
          />
        )}
        {groupedBranches.map(([country, branches]) => (
          <div key={country} className="space-y-4">
            {branches.map((b, i) => {
              const key = `${country}:${i}` as BranchKey;
              return <BranchPanel key={key} branch={b} expanded={expanded.has(key)} onToggle={() => toggle(key)} />;
            })}
          </div>
        ))}
        {!mainBranch && groupedBranches.length === 0 && (
          <p className="text-muted-foreground text-sm">No contact information available.</p>
        )}
      </ItemContent>
    </Item>
  );
}

function BranchPanel({
  branch,
  expanded,
  onToggle,
  isMain = false,
  primaryContactInfo,
}: {
  branch: CompanyContactInfo;
  expanded: boolean;
  onToggle: () => void;
  isMain?: boolean;
  primaryContactInfo?: CompanyPrimaryContactInfo;
}) {
  const summary = [branch.city, branch.country].filter(Boolean).join(', ');
  const heading = isMain ? 'Main Address' : 'Branch Address';

  return (
    <Collapsible open={expanded} onOpenChange={onToggle} className="border rounded-md">
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md">
        <span
          aria-hidden
          className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-medium"
        >
          {expanded ? '−' : '+'}
        </span>
        <span className="text-[13px] font-medium">
          <span className="mr-1">{heading}:</span>
          {summary || '—'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pt-1 data-[state=closed]:animate-none">
        <div id={`panel-${heading}-${summary}`} className="mt-2 text-[13px] space-y-6">
          {/* Address Table */}
          <div className="overflow-hidden rounded-md border bg-background">
            <Table>
              <TableBody>
                <VerticalRow label="Address" value={branch.address} />
                <VerticalRow label="City" value={branch.city} />
                {branch.state && <VerticalRow label="State/Province" value={branch.state} />}
                <VerticalRow label="Country" value={branch.country} />
                {isMain && <VerticalRow label="Zip Code" value={branch.zipCode} />}
              </TableBody>
            </Table>
          </div>

          {/* Primary Contact Table */}
          {isMain && (primaryContactInfo?.contactName || primaryContactInfo?.contactEmail) && (
            <div className="overflow-hidden rounded-md border bg-background">
              <Table>
                <TableBody>
                  {primaryContactInfo?.contactName && (
                    <VerticalRow
                      label="Contact Person"
                      value={`${primaryContactInfo.contactName}$$${
                        primaryContactInfo.contactPosition ? ` (${primaryContactInfo.contactPosition})` : ''
                      }`.replace('$', '')}
                    />
                  )}
                  {primaryContactInfo?.contactEmail && (
                    <VerticalRow
                      label="Contact Email"
                      value={
                        <a
                          href={`mailto:${primaryContactInfo.contactEmail}`}
                          className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                        >
                          {primaryContactInfo.contactEmail}
                        </a>
                      }
                    />
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function VerticalRow({ label, value }: { label: string; value?: React.ReactNode | string | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
      <TableCell className="bg-muted/50 py-2 font-medium align-top w-40 whitespace-nowrap text-[11px] uppercase tracking-wide">
        {label}
      </TableCell>
      <TableCell className="py-2 align-top break-words leading-snug text-[13px]">{value}</TableCell>
    </TableRow>
  );
}
