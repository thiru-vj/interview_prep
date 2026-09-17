import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoadingState } from '@/components/common/LoadingState'

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })))
const Languages = lazy(() => import('@/pages/Languages').then((m) => ({ default: m.Languages })))
const Language = lazy(() => import('@/pages/Language').then((m) => ({ default: m.Language })))
const Topic = lazy(() => import('@/pages/Topic').then((m) => ({ default: m.Topic })))
const Question = lazy(() => import('@/pages/Question').then((m) => ({ default: m.Question })))
const Search = lazy(() => import('@/pages/Search').then((m) => ({ default: m.Search })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

export function App() {
  return (
    <Suspense fallback={<LoadingState label="Loading page..." />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/languages" element={<Languages />} />
          <Route path="/languages/:slug" element={<Language />} />
          <Route path="/languages/:slug/topics/:topicSlug" element={<Topic />} />
          <Route path="/questions/:slug" element={<Question />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
