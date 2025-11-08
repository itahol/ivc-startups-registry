export const COMPANY_STAGE = {
  SEED: 'Seed',
  RD: 'R&D',
  INITIAL_REVENUES: 'Initial Revenues',
  REVENUE_GROWTH: 'Revenue Growth',
} as const;

export const COMPANY_STAGE_VALUES = Object.values(COMPANY_STAGE);

export type SectorOption = (typeof SECTOR_VALUES)[number];

export const SECTORS = {
  AGRITECH: 'Agritech',
  BIOMED: 'Biomed',
  DIGITAL_HEALTH: 'Digital Health',
  MEDICAL_DEVICES: 'Medical Devices',
  CLEANTECH: 'Cleantech',
  ENERGY: 'Energy',
  CONSUMER_SOFTWARE: 'Consumer-Oriented Software',
  ENTERPRISE_SOFTWARE: 'Enterprise Software & Infrastructure',
  NETWORK_INFRASTRUCTURE: 'Network Infrastructure',
  HARDWARE_INDUSTRIAL: 'Hardware & Industrial',
  SEMICONDUCTOR: 'Semiconductor',
} as const;

export const SECTOR_VALUES = Object.values(SECTORS);

export type CompanyStageOption = (typeof COMPANY_STAGE_VALUES)[number];

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
  isPrivateInvestorPublished: boolean;
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
  isPersonPublished: boolean;
}

export interface ExecutiveCompanyRelation {
  companyID: string;
  companyName: string | null;
  contactID: string;
  contactName: string | null;
  positionTitle: string | null;
  isCurrent: boolean;
}

export interface CompanyBoardMember {
  contactID: string | null;
  boardName: string | null;
  boardPosition: string | null;
  otherPositions: string | null;
  isPersonPublished: boolean;
}

export interface BoardMemberCompanyRelation {
  companyID: string;
  companyName: string | null;
  contactID: string;
  contactName: string | null;
  boardName: string | null;
  boardPosition: string | null;
  otherPositions: string | null;
}

export interface CompanyPrimaryContactInfo {
  contactID: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPosition: string | null;
  isPersonPublished: boolean;
}

export interface CompanyContactInfo {
  type: 'Main' | 'Branch' | string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  zipCode: string | null;
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

export interface Person {
  contactID: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cv: string | null;
  linkedInProfile: string | null;
}

export interface PersonPosition {
  companyID: string;
  companyName: string | null;
  companyType: string | null;
  companyStatus: string | null;
  title: string | null;
  isCurrent: boolean;
}
