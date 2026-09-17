import { Atom, Code2, Coffee, Database, FileCode2, type LucideIcon } from 'lucide-react'

/** Maps the `languages.icon` column (a stable string identifier) to a Lucide icon component. */
const ICON_MAP: Record<string, LucideIcon> = {
  coffee: Coffee,
  'file-code-2': FileCode2,
  atom: Atom,
  database: Database,
}

export function getLanguageIcon(icon: string | null): LucideIcon {
  return (icon && ICON_MAP[icon]) || Code2
}
