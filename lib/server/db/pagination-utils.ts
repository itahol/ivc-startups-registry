import { SelectQueryBuilder } from 'kysely';
import { PaginationOptions } from './queries';

export async function getPage<DB, TB extends keyof DB, O>({
  queryBuilder,
  paginationOptions,
}: {
  queryBuilder: SelectQueryBuilder<DB, TB, O>;
  paginationOptions: PaginationOptions;
}): Promise<O[]> {
  const { offset = 0, maxPageSize = 100 } = paginationOptions;
  return await queryBuilder.offset(offset).fetch(maxPageSize).execute();
}
export async function* paginateQuery<DB, TB extends keyof DB, O>({
  queryBuilder,
  paginationOptions,
}: {
  queryBuilder: SelectQueryBuilder<DB, TB, O>;
  paginationOptions: PaginationOptions;
}): AsyncIterable<O[]> {
  const maxPageSize = paginationOptions.maxPageSize ?? 100;
  let offset = paginationOptions.offset ?? 0;
  let page: O[] = [];

  do {
    page = await getPage({ queryBuilder, paginationOptions: { offset, maxPageSize } });
    yield page;
    offset += page.length;
  } while (page.length >= maxPageSize);
}
