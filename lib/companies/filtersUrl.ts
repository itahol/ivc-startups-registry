import { COMPANY_STAGE_VALUES, companyStageValidator, SECTOR_VALUES, sectorValidator } from '@/convex/schema';
import { validate } from 'convex-helpers/validators';
import { v } from 'convex/values';

export interface CompanyFilters {
  techVerticals?: { ids: string[]; operator: 'AND' | 'OR' };
  sectors?: (typeof SECTOR_VALUES)[number][];
  stages?: (typeof COMPANY_STAGE_VALUES)[number][];
  yearEstablished?: { min?: number; max?: number };
}

export const FILTER_PARAM_KEYS = ['tv', 'tvOp', 'sectors', 'stages', 'ymin', 'ymax'] as const;

const isSector = (sector: unknown) => validate(sectorValidator, sector);

const isStage = (stage: unknown) => validate(companyStageValidator, stage);

export function readCompanyFilters(searchParams: URLSearchParams): CompanyFilters {
  const next: CompanyFilters = {};
  // tech verticals
  const techVerticals = searchParams.get('tv');
  if (techVerticals) {
    const ids = techVerticals
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (ids.length) {
      const op = searchParams.get('tvOp') === 'AND' ? 'AND' : 'OR';
      const cleanedIds = Array.from(new Set(ids)).sort();
      next.techVerticals = { ids: cleanedIds, operator: op };
    }
  }
  // sectors
  const sectors = searchParams.get('sectors');
  if (sectors) {
    const arr = sectors
      .split(',')
      .map((s) => s.trim())
      .filter(isSector);
    if (arr.length) next.sectors = Array.from(new Set(arr)).sort();
  }
  // stages
  const stages = searchParams.get('stages');
  if (stages) {
    const arr = stages
      .split(',')
      .map((s) => s.trim())
      .filter(isStage);
    if (arr.length) next.stages = Array.from(new Set(arr)).sort();
  }
  // year established
  const ymin = searchParams.get('ymin');
  const ymax = searchParams.get('ymax');
  const minNum = ymin !== null && ymin !== '' ? Number(ymin) : undefined;
  const maxNum = ymax !== null && ymax !== '' ? Number(ymax) : undefined;
  const validMin = minNum !== undefined && !Number.isNaN(minNum) ? minNum : undefined;
  const validMax = maxNum !== undefined && !Number.isNaN(maxNum) ? maxNum : undefined;
  if (validMin !== undefined || validMax !== undefined) {
    next.yearEstablished = { min: validMin, max: validMax };
  }
  return next;
}

export function encodeCompanyFilters(filters: CompanyFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.techVerticals?.ids?.length) {
    const ids = [...filters.techVerticals.ids].sort();
    sp.set('tv', ids.join(','));
    sp.set('tvOp', filters.techVerticals.operator);
  }
  if (filters.sectors?.length) sp.set('sectors', [...filters.sectors].sort().join(','));
  if (filters.stages?.length) sp.set('stages', [...filters.stages].sort().join(','));
  if (filters.yearEstablished?.min !== undefined) sp.set('ymin', String(filters.yearEstablished.min));
  if (filters.yearEstablished?.max !== undefined) sp.set('ymax', String(filters.yearEstablished.max));
  sp.sort();
  return sp;
}

export function hasActiveCompanyFilters(f: CompanyFilters): boolean {
  return !!(f.techVerticals || f.sectors || f.stages || f.yearEstablished);
}
