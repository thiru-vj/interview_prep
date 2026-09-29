import { getDsaData } from '@/services/dsaService'
import { useAsync } from './useAsync'

export function useDsaData() {
  return useAsync(() => getDsaData(), [])
}
