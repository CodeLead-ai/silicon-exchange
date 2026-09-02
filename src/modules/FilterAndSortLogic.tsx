/**
 * Filter and sort logic — owned by increment inc-7.
 *
 * Pure filter/sort: search, region, memory range, status, and sort by
 * price, memory, TFLOPS, utilization. Renders nothing; exports pure
 * functions for downstream modules.
 */

export interface ListingLike {
  id: string;
  name: string;
  region: string;
  memory: number;
  tFlops: number;
  utilization: number;
  price: number;
  status: string;
}

export type SortField = 'price' | 'memory' | 'tFlops' | 'utilization';
export type SortDirection = 'asc' | 'desc';

export interface FilterCriteria {
  search?: string;
  region?: string;
  memoryMin?: number;
  memoryMax?: number;
  status?: string;
}

/**
 * Filter listings by the given criteria. All criteria are ANDed together.
 * - search: case-insensitive substring match on name
 * - region: exact match
 * - memoryMin / memoryMax: inclusive range on memory (GB)
 * - status: exact match
 * Returns an empty array if no listing matches.
 */
export function filterListings<T extends ListingLike>(
  listings: T[],
  criteria: FilterCriteria,
): T[] {
  return listings.filter((l) => {
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      if (!l.name.toLowerCase().includes(q)) return false;
    }
    if (criteria.region !== undefined) {
      if (l.region !== criteria.region) return false;
    }
    if (criteria.memoryMin !== undefined) {
      if (l.memory < criteria.memoryMin) return false;
    }
    if (criteria.memoryMax !== undefined) {
      if (l.memory > criteria.memoryMax) return false;
    }
    if (criteria.status !== undefined) {
      if (l.status !== criteria.status) return false;
    }
    return true;
  });
}

/**
 * Sort listings by the given field and direction.
 * Returns a new array; does not mutate the input.
 */
export function sortListings<T extends ListingLike>(
  listings: T[],
  field: SortField,
  direction: SortDirection,
): T[] {
  const sorted = [...listings].sort((a, b) => a[field] - b[field]);
  return direction === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Combined query: apply all filters, then sort the result.
 * Returns an empty array if no listing matches the filters.
 */
export function queryListings<T extends ListingLike>(
  listings: T[],
  criteria: FilterCriteria,
  field: SortField,
  direction: SortDirection,
): T[] {
  const filtered = filterListings(listings, criteria);
  return sortListings(filtered, field, direction);
}

export function FilterAndSortLogic() {
  return null;
}
