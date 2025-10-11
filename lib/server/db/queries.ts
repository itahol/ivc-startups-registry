import { Expression, ExpressionBuilder, expressionBuilder, SelectQueryBuilder, Simplify, sql, SqlBool } from 'kysely';
import { DB } from 'kysely-codegen';
import {
  CompanyBoardMember,
  CompanyDealInvestor,
  CompanyDetails,
  CompanyExecutive,
  CompanyFullDetails,
  CompanyFundingDeal,
  CompanyID,
  DealID,
  TechVertical,
} from '../../model';
import { db } from './index';

export const COMPANY_STAGE = {
  SEED: 'Seed',
  RD: 'R&D',
  INITIAL_REVENUES: 'Initial Revenues',
  REVENUE_GROWTH: 'Revenue Growth',
} as const;

export const COMPANY_STAGE_VALUES = Object.values(COMPANY_STAGE);

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

export type FilterOperator = 'AND' | 'OR';

export type ManyFilter<T> = {
  ids: T[];
  operator: FilterOperator;
};

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface CompaniesQueryOptions {
  techVerticalsFilter?: ManyFilter<string>;
  sectors?: string[];
  stages?: string[];
  yearEstablished?: {
    min?: number;
    max?: number;
  };
}

export const QUERIES = {
  getTechVerticals: function () {
    return db
      .selectFrom(
        db
          .selectFrom('Tags')
          .select([
            'Tags.Tags_ID as id',
            'Tags.Tags_Name as name',
            sql`ROW_NUMBER() OVER (PARTITION BY Tags.Tags_ID ORDER BY Tags.Tags_Name)`.as('rn'),
          ])
          .where('Web_Published_Tag', '=', 'Yes')
          .as('t'),
      )
      .select(['t.id', 't.name'])
      .where('t.rn', '=', 1)
      .execute();
  },

  getCompanies: function (options: CompaniesQueryOptions & PaginationOptions = {}): Promise<CompanyDetails[]> {
    const { limit = 100, offset = 0 } = options;

    return db
      .selectFrom('Profiles')
      .select([
        'Profiles.Company_ID as companyID',
        'Company_Name as companyName',
        'Short_Name as shortName',
        'Website as website',
        'Sector as sector',
        'Stage as stage',
        'Company_Description as companyDescription',
        'Technology as technology',
        'Employees as employees',
        'Israeli_Employees as israeliEmployees',
        'Reg_Number as regNumber',
        'Established_Year as establishedYear',
        'Tech_Verticals as techVerticalsNames',
      ])
      .where((eb) => matchesCompanyFilters(eb, options))
      .orderBy('Profiles.Company_ID')
      .offset(offset)
      .fetch(limit)
      .execute();
  },

  getCompaniesCount: async function (options: CompaniesQueryOptions = {}): Promise<number> {
    return db
      .selectFrom('Profiles')
      .select(({ fn }) => [fn.count<number>('Profiles.Company_ID').as('count')])
      .where((eb) => matchesCompanyFilters(eb, options))
      .executeTakeFirst()
      ?.then((result) => result?.count ?? 0);
  },

  getCompanyManagement: function ({ companyId }: { companyId: string }): Promise<CompanyExecutive[]> {
    console.log('Fetching management for companyId:', companyId);
    return getCompanyManagement({ companyId }).execute();
  },

  getCompanyBoard: function ({ companyId }: { companyId: CompanyID }): Promise<CompanyBoardMember[]> {
    return getCompanyBoard({ companyId }).execute();
  },

  getCompanyDeals: function ({ companyId }: { companyId: CompanyID }): Promise<CompanyFundingDeal[]> {
    return getCompanyDeals({ companyId }).execute();
  },

  getCompanyTechVerticals: function ({ companyId }: { companyId: CompanyID }): Promise<TechVertical[]> {
    return getCompanyTechVerticals({ companyId }).execute();
  },

  getCompanyDetails: function ({ companyId }: { companyId: CompanyID }): Promise<CompanyFullDetails | undefined> {
    return db
      .selectFrom('Profiles')
      .select([
        'Profiles.Company_ID as companyID',
        'Company_Name as companyName',
        'Short_Name as shortName',
        'Website as website',
        'Sector as sector',
        'Stage as stage',
        'Company_Description as companyDescription',
        'Technology as technology',
        'Employees as employees',
        'Israeli_Employees as israeliEmployees',
        'Reg_Number as regNumber',
        'Established_Year as establishedYear',
      ])
      .where('Profiles.Company_ID', '=', companyId)
      .executeTakeFirst();
  },
};

function getCompanyManagement({
  companyId,
}: {
  companyId: Expression<CompanyID> | CompanyID;
}): SelectQueryBuilder<DB, 'Management', CompanyExecutive> {
  return db
    .selectFrom('Management')
    .where('Management.Company_ID', '=', companyId)
    .where('Hide_Position', '=', 'No')
    .where('Past_Position', '=', 'No')
    .select(['Contact_ID as contactID', 'Contact_Name as contactName', 'Position_Title as positionTitle']);
}

function getCompanyBoard({
  companyId,
}: {
  companyId: Expression<CompanyID> | CompanyID;
}): SelectQueryBuilder<DB, 'Board', CompanyBoardMember> {
  return db
    .selectFrom('Board')
    .where('Board.Company_ID', '=', companyId)
    .select([
      'Contact_ID as contactID',
      'Board_Name as boardName',
      'Board_Position as boardPosition',
      'Other_Positions as otherPositions',
    ])
    .$assertType<CompanyBoardMember>();
}

function getCompanyTechVerticals({
  companyId,
}: {
  companyId: Expression<CompanyID> | CompanyID;
}): SelectQueryBuilder<DB, 'Tags', TechVertical> {
  return db
    .selectFrom('Tags')
    .where('Tags.Company_ID', '=', companyId)
    .where('Tags.Web_Published_Tag', '=', 'Yes')
    .select(['Tags_ID as tagID', 'Tags_Name as tagName']);
}

function getCompanyDeals({
  companyId,
}: {
  companyId: Expression<CompanyID> | CompanyID;
}): SelectQueryBuilder<DB, 'Deals', CompanyFundingDeal> {
  return db
    .selectFrom('Deals')
    .where('Deals.Company_ID', '=', companyId)
    .select([
      'Deals.Deal_ID as dealID',
      'Deals.Deal_Date as dealDate',
      'Deals.Deal_Type as dealType',
      'Deals.Deal_Stage as dealStage',
      'Deals.Deal_Amount as dealAmount',
      'Deals.Company_Post_Valuation as companyPostValuation',
    ])
    .select(({ eb }) => jsonArrayFrom(getDealInvestors({ dealId: eb.ref('Deals.Deal_ID') })).as('investors'));
}

function getDealInvestors({
  dealId,
}: {
  dealId: Expression<DealID>;
}): SelectQueryBuilder<DB, 'Investors', CompanyDealInvestor> {
  const eb = expressionBuilder<Pick<DB, 'Investors' | 'Profiles' | 'Contacts'>, never>();
  return eb
    .selectFrom('Investors')
    .leftJoin('Profiles', 'Investors.Company_Investor_ID', 'Profiles.Company_ID')
    .leftJoin('Contacts', 'Investors.Private_Investor_ID', 'Contacts.Contact_ID')
    .where('Investors.Deal_ID', '=', dealId)
    .select([
      'Investors.Investment_Amount as investmentAmount',
      'Investors.Company_Investor_ID as companyInvestorID',
      'Investors.Private_Investor_ID as privateInvestorID',
      'Investors.Investment_Remarks as investmentRemarks',
      'Profiles.Company_SubType as investorCompanyType',
    ])
    .select((eb) =>
      eb.fn.coalesce(eb.ref('Profiles.Company_Name'), eb.ref('Contacts.Contact_Name')).as('investorName'),
    );
}

const matchesCompanyFilters = (eb: ExpressionBuilder<DB, 'Profiles'>, options: CompaniesQueryOptions) => {
  const filters: (Expression<SqlBool> | undefined)[] = [];
  const { techVerticalsFilter, sectors, stages, yearEstablished } = options;
  if (techVerticalsFilter) {
    filters.push(hasTechVerticals({ companyId: eb.ref('Profiles.Company_ID'), techVerticalsFilter }));
  }
  if (sectors && sectors.length > 0) filters.push(eb('Profiles.Sector', 'in', sectors));
  if (stages && stages.length > 0) filters.push(eb('Profiles.Stage', 'in', stages));
  if (yearEstablished && (yearEstablished.min !== undefined || yearEstablished.max !== undefined)) {
    if (yearEstablished.min !== undefined && yearEstablished.max !== undefined) {
      filters.push(eb.between('Profiles.Established_Year', yearEstablished.min, yearEstablished.max));
    } else if (yearEstablished.min !== undefined) {
      filters.push(eb('Profiles.Established_Year', '>=', yearEstablished.min));
    } else if (yearEstablished.max !== undefined) {
      filters.push(eb('Profiles.Established_Year', '<=', yearEstablished.max));
    }
  }
  const realFilters = filters.filter((f) => f !== undefined);
  return eb.and(realFilters);
};

function hasTechVerticals({
  companyId,
  techVerticalsFilter,
}: {
  companyId: Expression<CompanyID>;
  techVerticalsFilter: ManyFilter<string>;
}): Expression<SqlBool> | undefined {
  const { ids: tagIds, operator } = techVerticalsFilter;
  if (tagIds.length === 0) {
    return undefined;
  }
  const eb = expressionBuilder<DB>();

  if (operator === 'OR') {
    return eb.exists(
      eb
        .selectFrom('Tags')
        .select('Tags.Tags_ID')
        .where('Tags.Company_ID', '=', companyId)
        .where('Tags.Tags_ID', 'in', tagIds),
    );
  }

  if (operator === 'AND') {
    return eb.exists(
      eb
        .selectFrom('Tags')
        .select('Tags.Company_ID')
        .where('Tags.Tags_ID', 'in', tagIds)
        .groupBy('Tags.Company_ID')
        .having('Tags.Company_ID', '=', companyId)
        .having(sql<number>`count(distinct "Tags"."Tags_ID")`, '=', tagIds.length),
    );
  }
}

function jsonArrayFrom<O>(expr: Expression<O>) {
  return sql<Simplify<O>[]>`(select coalesce((select * from ${expr} as agg for json path), '[]'))`;
}
