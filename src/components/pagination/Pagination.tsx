import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

/** Builds a compact page-number list with ellipsis gaps, e.g. 1 … 4 5 6 … 12 */
function buildPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  const delta = 1
  const pages: (number | 'ellipsis')[] = []
  const range: number[] = []

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    range.push(i)
  }

  pages.push(1)
  if (range[0] > 2) pages.push('ellipsis')
  pages.push(...range)
  if (range[range.length - 1] < totalPages - 1) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

const buttonBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'
const buttonNeutral =
  'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
const buttonActive = 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600'

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pageList = buildPageList(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 py-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {from}–{to} of {total} questions
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          className={`${buttonBase} ${buttonNeutral}`}
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${buttonBase} ${buttonNeutral}`}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pageList.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`${buttonBase} ${item === page ? buttonActive : buttonNeutral}`}
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className={`${buttonBase} ${buttonNeutral}`}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${buttonBase} ${buttonNeutral}`}
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
