import type { Expression, Simplify } from "kysely";
import { sql } from "kysely";

export function jsonArrayFrom<O>(expr: Expression<O>) {
  return sql<Simplify<O>[]>`(select coalesce((select * from ${expr} as agg for json path), '[]'))`;
}
