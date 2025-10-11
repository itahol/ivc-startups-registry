export type CompanyID = string | null;

export type DealID = string | null;

export interface TechVertical {
  tagID: string | null;
  tagName: string | null;
}

export interface CompanyDealInvestor {
  companyInvestorID: string | null;
  investmentAmount: number | null;
  investmentRemarks: string | null;
  privateInvestorID: string | null;
  investorCompanyType: string | null;
  investorName: string | null;
}

export interface CompanyFundingDeal {
  companyPostValuation: number | null;
  dealAmount: number | null;
  dealDate: Date | null;
  dealID: string;
  dealStage: string | null;
  dealType: string | null;
  investors: CompanyDealInvestor[];
}

export interface CompanyExecutive {
  contactID: string | null;
  contactName: string | null;
  positionTitle: string | null;
}

export interface CompanyBoardMember {
  contactID: string | null;
  boardName: string | null;
  boardPosition: string | null;
  otherPositions: string | null;
}

export interface CompanyFullDetails {
  companyID: CompanyID;
  companyName: string | null;
  companyDescription: string | null;
  establishedYear: number | null;
  employees: number | null;
  israeliEmployees: number | null;
  regNumber: string | null;
  sector: string | null;
  shortName: string | null;
  stage: string | null;
  technology: string | null;
  website: string | null;
}

export type CompanyDetails = Pick<
  CompanyFullDetails,
  'companyID' | 'companyName' | 'companyDescription' | 'establishedYear' | 'stage' | 'sector' | 'website'
> & { techVerticalsNames: string | null };
