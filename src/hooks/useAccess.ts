import { useContext } from 'react'
import { AccessContext } from '@/context/accessContext'

export function useAccess() {
  const context = useContext(AccessContext)
  if (!context) throw new Error('useAccess must be used inside <AccessProvider>')
  return context
}
