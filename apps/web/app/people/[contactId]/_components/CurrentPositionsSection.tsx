"use client";
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

export default function CurrentPositionsSection({
  positions,
}: {
  positions: PersonPosition[];
}) {
  return (
    <Item className="flex-col items-start p-0">
      <ItemTitle className="text-sm font-semibold">Current Positions</ItemTitle>
      <ItemContent className="mt-3 w-full space-y-3">
        {positions.length > 0 ? (
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
              {positions.map((position, idx) => (
                <TableRow key={idx} className="text-[13px]">
                  <TableCell className="font-medium">
                    <Link
                      href={`/companies/${position.companyID}`}
                      className="text-primary hover:text-primary/80 hover:underline"
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
        ) : (
          <p className="text-muted-foreground text-sm">
            No current positions available.
          </p>
        )}
      </ItemContent>
    </Item>
  );
}
