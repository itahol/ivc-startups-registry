Overview

- This module contains the MSSQL database wiring and a set of composable, typed query helpers built with Kysely.
- If you're not sure what's the most idiomatic way to accomplish a task in Kysely or asked by a user on Kysely best practices, patterns, etc - check the docs at https://kysely.dev/llms-full.txt

Connection / index.ts

- Creates a `Kysely<DB>` instance using `MssqlDialect`.
- Exports a single `db` instance that other modules import.

Query patterns / queries.ts

- Exports a `QUERIES` object that contains all READ ONLY queries. That is the API for other modules.
- Many helper functions (e.g. `getCompanyManagement`, `getCompanyBoard`, `getCompanyDeals`) return `SelectQueryBuilder<...>` instead of executing directly. This enables composition and reuse (for example embedding subqueries in JSON-producing helpers).
- Uses `expressionBuilder` for more advanced subqueries and to build `EXISTS` or grouped filters.
- Implements complex filter logic by building an array of `Expression<SqlBool>` and combining them with `eb.and(...)`.
- Uses typed result mapping (e.g. `as` aliases) to produce domain-shaped output objects.

Helpers

- `jsonArrayFrom(expr)` wraps a subquery to return a JSON array (coalescing to `[]` if empty).

Typing

- Uses generated `DB` types from `kysely-codegen` and domain types from `../../model` to keep queries strongly typed.

Usage notes

- MUST use `QUERIES` when reading from the DB.
- MUST type all query results with domain types from `../../model`.
- NEVER import `db` directly outside this folder.

This file explains the architectural patterns an agent should follow when extending or calling queries in this folder.
