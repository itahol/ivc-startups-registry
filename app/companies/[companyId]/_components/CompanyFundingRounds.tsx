'use client';
import { useState, useMemo } from 'react';
import { CompanyDealInvestor, CompanyFundingDeal } from '@/lib/model';
import { Item, ItemTitle, ItemContent } from '@/components/ui/item';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface CompanyFundingRoundsProps {
  deals: CompanyFundingDeal[];
}

export function CompanyFundingRounds({ deals }: CompanyFundingRoundsProps) {
  const orderedDeals = useMemo(() => {
    return [...(deals || [])].sort((a, b) => {
      const ad = a.dealDate ? new Date(a.dealDate).getTime() : 0;
      const bd = b.dealDate ? new Date(b.dealDate).getTime() : 0;
      return bd - ad; // newest first
    });
  }, [deals]);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleId = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOpen = orderedDeals.length > 0 && openIds.size === orderedDeals.length;
  const hasAnyOpen = openIds.size > 0;

  const toggleAll = () => {
    if (allOpen) {
      setOpenIds(new Set());
    } else {
      setOpenIds(new Set(orderedDeals.map((d) => d.dealID)));
    }
  };

  const { totalRaised, investorCount } = useMemo(() => {
    const totalRaised = orderedDeals.reduce((sum, d) => sum + (d.dealAmount ?? 0), 0);
    const investorKeys = new Set<string>();
    orderedDeals.forEach((d) => {
      d.investors.forEach((i) => {
        const key = i.companyInvestorID || i.privateInvestorID || i.investorName || Math.random().toString();
        investorKeys.add(key);
      });
    });
    return { totalRaised, investorCount: investorKeys.size };
  }, [orderedDeals]);

  if (!orderedDeals || orderedDeals.length === 0) {
    return (
      <Item className="flex-col items-start p-0">
        <ItemTitle className="text-sm font-semibold">Financial Rounds</ItemTitle>
        <ItemContent className="mt-3 text-sm text-muted-foreground">No financial rounds recorded.</ItemContent>
      </Item>
    );
  }

  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">Financial Rounds</ItemTitle>
      <ItemContent className="mt-3 w-full space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <SummaryStat label="Total Capital Raised" value={formatMoney(totalRaised)} />
          <SummaryStat label="Financial Rounds" value={orderedDeals.length.toString()} />
          <SummaryStat label="Number of Investors" value={investorCount.toString()} />
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
            aria-pressed={allOpen}
          >
            {allOpen ? 'Collapse All' : hasAnyOpen ? 'Expand All' : 'Expand All'}
          </button>
        </div>

        <div className="space-y-2 overflow-x-auto">
          <div>
            {/* Column headers using grid to align with rows */}
            <div
              className="hidden md:grid grid-cols-7 items-center gap-4 px-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium"
              style={{ gridTemplateColumns: '24px 1fr 1fr 120px 1fr 96px 112px' }}
            >
              <div className="col-span-1" aria-hidden></div>
              <div className="col-span-2 min-w-0">Round</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 min-w-0">Stage</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1 text-right">Post Valuation</div>
            </div>
            {orderedDeals.map((deal) => {
              const isOpen = openIds.has(deal.dealID);
              const dealDate = deal.dealDate ? formatDate(deal.dealDate) : '—';
              return (
                <div key={deal.dealID} className="border rounded-md">
                  <button
                    type="button"
                    onClick={() => toggleId(deal.dealID)}
                    aria-expanded={isOpen}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left text-[13px] font-medium hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-t-md',
                      !isOpen && 'rounded-b-md',
                    )}
                  >
                    <div
                      className="grid items-center gap-4 w-full"
                      style={{ gridTemplateColumns: '24px 1fr 1fr 120px 1fr 96px 112px' }}
                    >
                      <span
                        className={cn(
                          'inline-block w-4 text-center transform transition-transform select-none shrink-0',
                          isOpen ? 'rotate-90' : '',
                        )}
                        aria-hidden
                      >
                        ▶
                      </span>
                      <div className="col-span-2 min-w-0 font-medium truncate">{deal.dealType || '—'}</div>
                      <div className="col-span-1 w-32 shrink-0 text-muted-foreground tabular-nums">{dealDate}</div>
                      <div className="col-span-1 min-w-0 text-muted-foreground truncate">{deal.dealStage || '—'}</div>
                      <div className="col-span-1 w-24 shrink-0 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                        {deal.dealAmount != null ? formatMoney(deal.dealAmount) : '—'}
                      </div>
                      <div className="col-span-1 w-28 shrink-0 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                        {deal.companyPostValuation != null ? formatMoney(deal.companyPostValuation) : '—'}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-2 text-[13px]">
                      {/* Deal meta incl. post valuation */}
                      {deal.companyPostValuation != null && (
                        <div className="mb-2 text-[12px] text-muted-foreground">
                          <span className="font-medium text-foreground">Post Valuation: </span>
                          {formatMoney(deal.companyPostValuation)}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/3 text-xs uppercase tracking-wide">Investor</TableHead>
                              <TableHead className="text-xs uppercase tracking-wide">Type</TableHead>
                              <TableHead className="text-xs uppercase tracking-wide">Amount</TableHead>
                              <TableHead className="text-xs uppercase tracking-wide">Remarks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deal.investors.length > 0 ? (
                              deal.investors
                                .toSorted((a, b) => {
                                  const typeA = deriveInvestorType(a);
                                  const typeB = deriveInvestorType(b);

                                  if (typeA === null && typeB !== null) {
                                    return 1;
                                  }
                                  if (typeA !== null && typeB === null) {
                                    return -1;
                                  }

                                  if (typeA === 'Private' && typeB !== 'Private') {
                                    return 1;
                                  }
                                  if (typeA !== 'Private' && typeB === 'Private') {
                                    return -1;
                                  }

                                  const typeComparison = (typeB || '').localeCompare(typeA || '');
                                  if (typeComparison !== 0) {
                                    return typeComparison;
                                  }
                                  return (a.investorName || '').localeCompare(b.investorName || '');
                                })
                                .map((inv, idx) => (
                                  <TableRow key={idx} className="text-[13px]">
                                    <TableCell className="font-medium">{inv.investorName || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {deriveInvestorType(inv) || '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {inv.investmentAmount != null ? formatMoney(inv.investmentAmount) : '—'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {inv.investmentRemarks || '—'}
                                    </TableCell>
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  No investors listed.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ItemContent>
    </Item>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border px-3 py-2 bg-muted/40">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-center leading-tight">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// Incoming raw numbers are in millions of USD.
// We need to clarify that and also abbreviate billions.
function formatMoney(rawMillions: number) {
  // Raw numbers are already in millions of USD.
  // So rawMillions = 1.5 means $1.5m; 1500 means $1.5b.
  if (rawMillions === 0) return '$0M';
  const abs = Math.abs(rawMillions);
  // If ≥ 1000 millions => billions
  if (abs >= 1000) {
    const billions = rawMillions / 1000; // convert millions to billions
    return `$${billions.toFixed(billions >= 10 ? 0 : 1)}B`;
  }
  // Otherwise stay in millions; display up to one decimal unless >= 10.
  return `$${rawMillions.toFixed(abs >= 10 ? 0 : 1)}M`;
}

function formatDate(date: Date | string) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}

function deriveInvestorType(inv: CompanyDealInvestor): string | null {
  if (inv.investorCompanyType) return inv.investorCompanyType;
  if (inv.privateInvestorID) return 'Private';
  return null;
}

export default CompanyFundingRounds;
