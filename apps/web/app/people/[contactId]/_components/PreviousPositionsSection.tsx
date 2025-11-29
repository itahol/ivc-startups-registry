"use client";
import { useState } from "react";
import { Item, ItemTitle, ItemContent } from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonPosition } from "@repo/model/model";
import Link from "next/link";

const PREVIOUS_POSITIONS_PREVIEW = 5;

export default function PreviousPositionsSection({
  positions,
}: {
  positions: PersonPosition[];
}) {
  const [showAll, setShowAll] = useState(false);
  const positionsToShow = showAll
    ? positions
    : positions.slice(0, PREVIOUS_POSITIONS_PREVIEW);

  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">
        Previous Positions
      </ItemTitle>
      <ItemContent className="mt-3 w-full space-y-3">
        {positions.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Name
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Company Type
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Company Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Title
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionsToShow.map((position, idx) => (
                  <TableRow key={idx} className="text-[13px]">
                    <TableCell className="font-medium">
                      <Link
                        href={`/companies/${position.companyID}`}
                        className="text-blue-600 hover:underline focus-visible:underline"
                      >
                        {position.companyName || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.companyType || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.companyStatus || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {position.title || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {positions.length > PREVIOUS_POSITIONS_PREVIEW && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
                aria-expanded={showAll}
              >
                {showAll ? "Show fewer" : `Show all (${positions.length})`}
              </button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            No previous positions available.
          </p>
        )}
      </ItemContent>
    </Item>
  );
}
