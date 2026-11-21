import { useCallback, useEffect, useState } from 'react'

export function useAsyncData<T>(fetcher: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la información.')
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, isLoading, error, reload }
}
