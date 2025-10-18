'use client';
import { useState } from 'react';
import { Item, ItemTitle, ItemContent } from '@/components/ui/item';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CompanyExecutive } from '@/lib/model';
import Link from 'next/link';

const MANAGEMENT_PREVIEW = 5;

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

export default function ManagementSection({ management }: { management: CompanyExecutive[] }) {
  const [showAllManagement, setShowAllMgmt] = useState(false);
  const orderedManagement = orderManagement(management);
  const managementToShow = showAllManagement ? orderedManagement : orderedManagement.slice(0, MANAGEMENT_PREVIEW);

  return (
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
                    <TableCell className="font-medium">
                      {managementPosition.contactID ? (
                        <Link
                          href={`/people/${managementPosition.contactID}`}
                          className="text-primary hover:text-primary/80 hover:underline"
                        >
                          {managementPosition.contactName || '—'}
                        </Link>
                      ) : (
                        managementPosition.contactName || '—'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{managementPosition.positionTitle || '—'}</TableCell>
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
  );
}
