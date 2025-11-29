import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const companiesQuerySchema = paginationSchema.extend({
  keyword: z.string().optional(),
  sectors: z
    .string()
    .optional()
    .transform((val) => val?.split(",").filter(Boolean)),
  stages: z
    .string()
    .optional()
    .transform((val) => val?.split(",").filter(Boolean)),
  minYear: z.coerce.number().int().min(1900).optional(),
  maxYear: z.coerce.number().int().min(1900).optional(),
});

export const contactIdSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
});

export const companyIdSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type CompaniesQuery = z.infer<typeof companiesQuerySchema>;
export type ContactIdParams = z.infer<typeof contactIdSchema>;
export type CompanyIdParams = z.infer<typeof companyIdSchema>;
