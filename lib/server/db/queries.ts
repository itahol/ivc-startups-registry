import { sql } from 'kysely';
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
    if (!techVerticalsFilter || techVerticalsFilter.ids.length === 0) {
      return db.selectFrom('Profiles').selectAll().top(limit).execute();
    }
    if (techVerticalsFilter.operator === 'OR') {
      return db
        .selectFrom('Profiles')
        .selectAll()
        .where(({ exists, selectFrom }) =>
          exists(
            selectFrom('Tags')
              .select('Tags.Tags_ID')
              .where('Tags.Tags_ID', 'in', techVerticalsFilter.ids)
              .whereRef('Tags.Company_ID', '=', 'Profiles.Company_ID'),
          ),
        )
        .top(limit)
        .execute();
    }

    const tagIds = techVerticalsFilter.ids;
    const eligible = db
      .selectFrom('Tags')
      .select('Tags.Company_ID')
      .where('Tags.Tags_ID', 'in', tagIds)
      .groupBy('Tags.Company_ID')
      .having(sql<number>`count(distinct "Tags"."Tags_ID")`, '=', tagIds.length)
      .as('eligible');

    return db
      .selectFrom('Profiles as p')
      .where(({ exists, selectFrom }) =>
        exists(selectFrom(eligible).select('eligible.Company_ID').whereRef('eligible.Company_ID', '=', 'p.Company_ID')),
      )
      .selectAll('p')
      .top(limit)
      .execute();
  },
};
