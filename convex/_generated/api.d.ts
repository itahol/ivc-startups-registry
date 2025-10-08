/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as companies from "../companies.js";
import type * as companyStages from "../companyStages.js";
import type * as entity from "../entity.js";
import type * as init from "../init.js";
import type * as model_company from "../model/company.js";
import type * as myFunctions from "../myFunctions.js";
import type * as stats from "../stats.js";
import type * as techVerticals from "../techVerticals.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  companies: typeof companies;
  companyStages: typeof companyStages;
  entity: typeof entity;
  init: typeof init;
  "model/company": typeof model_company;
  myFunctions: typeof myFunctions;
  stats: typeof stats;
  techVerticals: typeof techVerticals;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
