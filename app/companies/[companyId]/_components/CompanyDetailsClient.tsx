"use client";
import { use } from "react";
import Link from "next/link";
import {
  Item,
  ItemGroup,
  ItemTitle,
  ItemContent,
  ItemDescription,
  ItemSeparator,
} from "@/components/ui/item";
import {
  CompanyBoardMember,
  CompanyContactInfo,
  CompanyExecutive,
  CompanyFullDetails,
  CompanyFundingDeal,
  CompanyPrimaryContactInfo,
  TechVertical,
} from "../../../../lib/model";
import ContactInfoSection from "./ContactInfoSection";
import { notFound } from "next/navigation";
import BoardSection from "./BoardSection";
import ManagementSection from "./ManagementSection";
import CompanyFundingRounds from "./CompanyFundingRounds";
import TechVerticalsSection from "./TechVerticalsSection";
import { Separator } from "../../../../components/ui/separator";

export default function CompanyDetailsClient(props: {
  companyPromise: Promise<CompanyFullDetails | undefined>;
  techVerticalsPromise: Promise<TechVertical[]>;
  managementPromise: Promise<CompanyExecutive[]>;
  boardPromise: Promise<CompanyBoardMember[]>;
  contactInfoPromise: Promise<{
    primaryContactInfo?: CompanyPrimaryContactInfo;
    branchesContactInfo: CompanyContactInfo[];
  }>;
  dealsPromise: Promise<CompanyFundingDeal[]>;
}) {
  const {
    companyPromise,
    managementPromise,
    techVerticalsPromise,
    boardPromise,
    dealsPromise,
    contactInfoPromise,
  } = props;
  const company = use(companyPromise);
  if (!company) {
    notFound();
  }
  const websiteHref =
    company.website &&
    (company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`);

  return (
    <div className="space-y-6 text-[15px] leading-relaxed">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {company.companyName}
        </h1>
        {websiteHref && (
          <p className="text-muted-foreground text-sm">
            <Link
              href={websiteHref}
              className="hover:underline focus-visible:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {new URL(websiteHref).hostname.replace(/^www\./, "")}
            </Link>
          </p>
        )}
      </header>

      <Separator />
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left column (About + Contact Info + Tech) */}
        <div className="lg:col-span-2 space-y-6">
          <ItemGroup className="gap-4">
            <Item className="flex-col items-start p-0">
              <ItemTitle className="text-sm font-semibold">About</ItemTitle>
              <ItemContent className="mt-2 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3 text-[13px]">
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Stage
                    </h2>
                    <p>{company.stage ?? "—"}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Sector
                    </h2>
                    <p>{company.sector ?? "—"}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Employees
                    </h2>
                    <p>{company.employees ?? "—"}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Israel Employees
                    </h2>
                    <p>{company.israeliEmployees ?? "—"}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium mb-1 uppercase tracking-wide text-muted-foreground">
                      Reg #
                    </h2>
                    <p>{company.regNumber ?? "—"}</p>
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
                    <p className="text-muted-foreground whitespace-pre-wrap leading-snug">
                      {company.technology}
                    </p>
                  </div>
                )}
              </ItemContent>
            </Item>
            <ItemSeparator />
            <TechVerticalsSection techVerticals={use(techVerticalsPromise)} />
            <ItemSeparator />
            <ContactInfoSection contactInfoPromise={contactInfoPromise} />
          </ItemGroup>
        </div>

        {/* Right column (Funding + People) */}
        <div className="lg:col-span-2 space-y-6">
          <CompanyFundingRounds deals={use(dealsPromise) || []} />
          <Separator />
          <ItemGroup className="gap-4">
            <ManagementSection management={use(managementPromise)} />
            <ItemSeparator />
            <BoardSection board={use(boardPromise)} />
          </ItemGroup>
        </div>
      </div>
    </div>
  );
}
