import { Expression, ExpressionBuilder, expressionBuilder, SelectQueryBuilder, Simplify, sql, SqlBool } from 'kysely';
import { DB } from 'kysely-codegen';
import { Company } from '../../model/profiiles';
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

  getCompanies: function (options: CompaniesQueryOptions & PaginationOptions = {}) {
    const { limit = 100, offset = 0 } = options;

    return db
      .selectFrom('Profiles')
      .selectAll('Profiles')
      .where((eb) => matchesCompanyFilters(eb, options))
      .orderBy('Profiles.Company_ID')
      .offset(offset)
      .fetch(limit)
      .execute();
  },

  getCompaniesCount: async function (options: CompaniesQueryOptions = {}) {
    return db
      .selectFrom('Profiles')
      .select(({ fn }) => [fn.count<number>('Profiles.Company_ID').as('count')])
      .where((eb) => matchesCompanyFilters(eb, options))
      .executeTakeFirst()
      ?.then((result) => result?.count ?? 0);
  },

  getCompanyDetails({ companyId }: { companyId: Expression<Company['Company_ID']> | Company['Company_ID'] }) {
    return db
      .selectFrom('Profiles')
      .select([
        'Company_Name',
        'Short_Name',
        'Website',
        'Sector',
        'Stage',
        'Company_Description',
        'Technology',
        'Employees',
        'Israeli_Employees',
        'Reg_Number',
      ])
      .select(({ eb }) =>
        jsonArrayFrom(getCompanyTechVerticals({ companyId: eb.ref('Profiles.Company_ID') })).as('techVerticals'),
      )
      .select(({ eb }) =>
        jsonArrayFrom(getCompanyManagement({ companyId: eb.ref('Profiles.Company_ID') })).as('management'),
      )
      .select(({ eb }) => jsonArrayFrom(getCompanyBoard({ companyId: eb.ref('Profiles.Company_ID') })).as('board'))
      .where('Profiles.Company_ID', '=', companyId)
      .executeTakeFirst();
  },
};

function getCompanyManagement({ companyId }: { companyId: Expression<Company['Company_ID']> }): SelectQueryBuilder<
  DB,
  'Management',
  {
    Contact_ID: string | null;
    Contact_Name: string | null;
    Position_Title: string | null;
  }
> {
  const eb = expressionBuilder<DB>();
  return eb
    .selectFrom('Management')
    .where('Management.Company_ID', '=', companyId)
    .where('Hide_Position', '=', 'No')
    .where('Past_Position', '=', 'No')
    .select(['Contact_ID', 'Contact_Name', 'Position_Title']);
}

function getCompanyBoard({ companyId }: { companyId: Expression<Company['Company_ID']> }): SelectQueryBuilder<
  DB,
  'Board',
  {
    Contact_ID: string | null;
    Board_Name: string | null;
    Board_Position: string | null;
    Other_Positions: string | null;
  }
> {
  const eb = expressionBuilder<DB>();
  return eb
    .selectFrom('Board')
    .where('Board.Company_ID', '=', companyId)
    .select(['Contact_ID', 'Board_Name', 'Board_Position', 'Other_Positions']);
}

function getCompanyTechVerticals({ companyId }: { companyId: Expression<Company['Company_ID']> }) {
  const eb = expressionBuilder<DB>();
  return eb
    .selectFrom('Tags')
    .where('Tags.Company_ID', '=', companyId)
    .where('Tags.Web_Published_Tag', '=', 'Yes')
    .select(['Tags_ID', 'Tags_Name']);
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
  companyId: Expression<Company['Company_ID']>;
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
