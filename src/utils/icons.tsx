import {
  Atom,
  Box,
  Code2,
  Coffee,
  Database,
  FileCode,
  FileCode2,
  Hexagon,
  Layers,
  MousePointerClick,
  Palette,
  Triangle,
  Wind,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps a stable string identifier (the `icon` column on `languages` and on
 * `cheatsheet_technologies`) to a Lucide icon component. Both tables share
 * this one lookup since they largely reference the same technologies.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  coffee: Coffee,
  'file-code-2': FileCode2,
  atom: Atom,
  database: Database,
  'file-code': FileCode,
  palette: Palette,
  wind: Wind,
  triangle: Triangle,
  hexagon: Hexagon,
  layers: Layers,
  box: Box,
  'mouse-pointer-click': MousePointerClick,
}

export function getLanguageIcon(icon: string | null): LucideIcon {
  return (icon && ICON_MAP[icon]) || Code2
}

export function getCheatsheetIcon(icon: string | null): LucideIcon {
  return (icon && ICON_MAP[icon]) || Code2
}
