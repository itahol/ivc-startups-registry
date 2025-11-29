"use client";
import { useState } from "react";
import Link from "next/link";
import { Item, ItemTitle, ItemContent } from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyBoardMember } from "@repo/model/model";

const BOARD_PREVIEW = 5;

function orderBoard(list: CompanyBoardMember[]) {
  const weight = (title: string | null) => {
    if (!title) return 99;
    const t = title.toLowerCase();
    if (t.includes("chairman") || t.includes("chairperson")) return 0;
    if (t.includes("board member")) return 1;
    if (t.includes("observer")) return 2;
    return 99;
  };
  return [...list].sort((a, b) => {
    const w = weight(a.boardPosition) - weight(b.boardPosition);
    if (w !== 0) return w;
    const an = a.boardName || "";
    const bn = b.boardName || "";
    return an.localeCompare(bn);
  });
}

export default function BoardSection({
  board,
}: {
  board: CompanyBoardMember[];
}) {
  const [showAllBoard, setShowAllBoard] = useState(false);
  const orderedBoard = orderBoard(board);
  const boardToShow = showAllBoard
    ? orderedBoard
    : orderedBoard.slice(0, BOARD_PREVIEW);

  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">Board</ItemTitle>
      <ItemContent className="mt-3 w-full space-y-3">
        {orderedBoard.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2 text-xs uppercase tracking-wide">
                    Name
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Title
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">
                    Affiliation
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boardToShow.map((boardMember, idx) => {
                  return (
                    <TableRow key={idx} className="text-[13px]">
                      <TableCell className="font-medium">
                        {boardMember.contactID &&
                        boardMember.isPersonPublished ? (
                          <Link
                            href={`/people/${boardMember.contactID}`}
                            className="text-primary hover:text-primary/80 hover:underline"
                          >
                            {boardMember.boardName || "—"}
                          </Link>
                        ) : (
                          boardMember.boardName || "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {boardMember.boardPosition || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {boardMember.otherPositions || "—"}
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
                {showAllBoard
                  ? "Show fewer"
                  : `Show all (${orderedBoard.length})`}
              </button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            No board data available.
          </p>
        )}
      </ItemContent>
    </Item>
  );
}
