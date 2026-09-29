import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { KeyboardShortcuts } from '@/components/common/KeyboardShortcuts'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ScrollToTop />
      <Navbar />
      <OfflineBanner />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <KeyboardShortcuts />
    </div>
  )
}
