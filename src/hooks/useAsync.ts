import { useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Runs an async fetcher whenever `deps` change, tracking loading/error/data state
 * and ignoring results from stale (superseded) requests.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  useEffect(() => {
    const id = ++requestId.current
    // Marking loading=true as the fetch starts (rather than deriving it) keeps stale data
    // on screen with a loading indicator instead of flashing to an empty state between requests.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ data: prev.data, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (requestId.current === id) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (requestId.current === id) {
          setState({ data: null, loading: false, error: error instanceof Error ? error : new Error('Unknown error') })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
