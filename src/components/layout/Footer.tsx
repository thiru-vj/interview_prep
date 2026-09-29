import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Interview Prep. Free technical interview questions.</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-4">
          {[
            ['/', 'Home'],
            ['/languages', 'Languages'],
            ['/dsa', 'DSA'],
            ['/roadmap', 'Roadmap'],
            ['/study', 'Study'],
            ['/progress', 'My Progress'],
            ['/search', 'Search'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="hover:text-slate-900 dark:hover:text-white">
              {label}
            </Link>
          ))}
          <span className="hidden sm:inline">
            Press <kbd className="font-mono">?</kbd> for shortcuts
          </span>
        </nav>
      </div>
    </footer>
  )
}
