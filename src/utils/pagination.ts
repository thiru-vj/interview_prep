export const PAGE_SIZE = 25

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Converts a 1-indexed page number into a Supabase `.range(from, to)` pair. */
export function getRange(page: number, pageSize: number = PAGE_SIZE): { from: number; to: number } {
  const safePage = Math.max(1, page)
  const from = (safePage - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number = PAGE_SIZE,
): PaginatedResult<T> {
  return {
    data,
    total,
    page: Math.max(1, page),
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Parses a `page` query param, always returning a valid 1-indexed page number. */
export function parsePageParam(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.floor(parsed)
}
