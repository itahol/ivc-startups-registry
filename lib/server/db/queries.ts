import { Expression, expressionBuilder, sql, SqlBool } from 'kysely';
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

  getCompanies: function (params: { limit?: number; techVerticalsFilter?: ManyFilter<string> } = {}) {
    const { limit = 100, techVerticalsFilter } = params;
    return db
      .selectFrom('Profiles')
      .selectAll('Profiles')
      .where((eb) => {
        const filters: (Expression<SqlBool> | undefined)[] = [];

        if (techVerticalsFilter) {
          filters.push(hasTechVerticals({ companyId: eb.ref('Profiles.Company_ID'), techVerticalsFilter }));
        }

        const realFilters = filters.filter((f) => f !== undefined);
        return eb.and(realFilters);
      })
      .top(limit)
      .execute();
  },
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
