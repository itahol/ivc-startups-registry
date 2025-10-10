import type { DB } from 'kysely-codegen';

export type Company = DB['Profiles'];

export type Deal = DB['Deals'];

export interface CompanyDealInvestor {
  Company_Investor_ID: string | null;
  Investment_Amount: number | null;
  Investment_Remarks: string | null;
  Private_Investor_ID: string | null;
  investor_company_type: string | null;
  investor_name: string | null;
}

export interface CompanyFundingDeal {
  Company_Post_Valuation: number | null;
  Deal_Amount: number | null;
  Deal_Date: Date | null;
  Deal_ID: string;
  Deal_Stage: string | null;
  Deal_Type: string | null;
  investors: CompanyDealInvestor[];
}

export interface CompanyExecutive {
  Contact_ID: string | null;
  Contact_Name: string | null;
  Position_Title: string | null;
}

export interface CompanyBoardMember {
  Contact_ID: string | null;
  Board_Name: string | null;
  Board_Position: string | null;
  Other_Positions: string | null;
}

export interface CompanyFullDetails {
  Company_Name: string | null;
  Company_Description: string | null;
  Employees: number | null;
  Israeli_Employees: number | null;
  Reg_Number: string | null;
  Sector: string | null;
  Short_Name: string | null;
  Stage: string | null;
  Technology: string | null;
  Website: string | null;
  techVerticals: {
    Tags_ID: string | null;
    Tags_Name: string | null;
  }[];
  management: CompanyExecutive[];
  board: CompanyBoardMember[];
  deals: CompanyFundingDeal[];
}
