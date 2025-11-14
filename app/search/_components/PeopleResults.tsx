import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { CompanyFilters } from "@/lib/companies/filtersUrl";
import {
  PersonCompanyRelationshipType,
  PersonSearchResult,
} from "@/lib/model";
import { QUERIES } from "@/lib/server/db/queries";

interface PeopleResultsProps {
  filters: CompanyFilters;
  page: number;
  pageSize: number;
  prevHref: string;
  nextHref: string;
  clearHref: string;
  hasActiveFilters: boolean;
}

const relationshipLabels: Record<PersonCompanyRelationshipType, string> = {
  executive: "Executive",
  board: "Board member",
  investor: "Investor",
};

export async function PeopleResults({
  filters,
  page,
  pageSize,
  prevHref,
  nextHref,
  clearHref,
  hasActiveFilters,
}: PeopleResultsProps) {
  const offset = (page - 1) * pageSize;
  const queryFilters = {
    keyword: filters.keyword,
    techVerticalsFilter: filters.techVerticals,
    sectors: filters.sectors,
    stages: filters.stages,
    yearEstablished: filters.yearEstablished,
  };

  const [people, total] = await Promise.all([
    QUERIES.getPeopleByCompanyFilters({
      ...queryFilters,
      maxPageSize: pageSize,
      offset,
    }),
    QUERIES.getPeopleByCompanyFiltersCount(queryFilters),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <PersonCard key={person.contactID} person={person} />
        ))}
      </div>

      {people.length === 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No people found for these filters.</EmptyTitle>
            {hasActiveFilters ? (
              <EmptyDescription>
                Try adjusting your filters to find the people you&apos;re looking
                for.
              </EmptyDescription>
            ) : null}
          </EmptyHeader>
          <EmptyContent>
            {hasActiveFilters ? (
              <div className="mt-4">
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={clearHref}
                    scroll={false}
                    aria-label="Clear filters to show all people"
                  >
                    Clear filters
                  </Link>
                </Button>
              </div>
            ) : null}
          </EmptyContent>
        </Empty>
      )}

      <div className="mt-12 flex flex-col items-center gap-3">
        <Pagination>
          <PaginationContent className="gap-3">
            <PaginationItem>
              {isFirstPage ? (
                <PaginationLink
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to previous page"
                  aria-disabled={true}
                  tabIndex={-1}
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </PaginationLink>
              ) : (
                <PaginationLink
                  asChild
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to previous page"
                >
                  <Link href={prevHref} scroll={false}>
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Link>
                </PaginationLink>
              )}
            </PaginationItem>
            <PaginationItem>
              <p className="text-muted-foreground text-sm" aria-live="polite">
                Page <span className="text-foreground">{page}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
              </p>
            </PaginationItem>
            <PaginationItem>
              {isLastPage ? (
                <PaginationLink
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to next page"
                  aria-disabled={true}
                  tabIndex={-1}
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </PaginationLink>
              ) : (
                <PaginationLink
                  asChild
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-label="Go to next page"
                >
                  <Link href={nextHref} scroll={false}>
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Link>
                </PaginationLink>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="text-xs text-muted-foreground">
          {total.toLocaleString()} results · Showing{" "}
          {(total === 0 ? 0 : (page - 1) * pageSize + 1).toLocaleString()}–
          {Math.min(page * pageSize, total).toLocaleString()}
        </div>
      </div>
    </>
  );
}

function PersonCard({ person }: { person: PersonSearchResult }) {
  const displayName = person.name ?? "Unnamed person";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold tracking-tight">
          <Link
            href={`/people/${person.contactID}`}
            className="hover:underline focus-visible:underline"
          >
            {displayName}
          </Link>
        </CardTitle>
        {(person.email || person.phone) && (
          <CardDescription className="space-y-1 text-sm">
            {person.email ? <p>{person.email}</p> : null}
            {person.phone ? <p>{person.phone}</p> : null}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        {person.relatedCompanies.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Related companies
            </p>
            <ul className="space-y-3 text-sm">
              {person.relatedCompanies.map((company) => (
                <li
                  key={`${person.contactID}-${company.companyID}`}
                  className="rounded-lg border bg-muted/20 p-3"
                >
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/companies/${company.companyID}`}
                      className="font-medium text-foreground hover:underline focus-visible:underline"
                    >
                      {company.companyName ?? "Untitled company"}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {company.relationships.map((relationship) => (
                        <Badge
                          key={relationship}
                          variant="outline"
                          className="text-xs font-medium capitalize"
                        >
                          {relationshipLabels[relationship]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No related companies matched the current filters.
          </p>
        )}
        {person.linkedInProfile ? (
          <div>
            <Link
              href={person.linkedInProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View LinkedIn profile
            </Link>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/people/${person.contactID}`}>View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
