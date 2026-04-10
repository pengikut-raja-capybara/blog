import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import RouteAnalyticsTracker from './analytics/RouteAnalyticsTracker';
import { AppLayout } from './components/layout';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));

function App() {
  return (
    <>
      <RouteAnalyticsTracker />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/blog/" element={<Home />} />
          <Route path="/blog/about" element={
            <Suspense fallback={<div className="p-8 text-center mt-20 text-dark/50 dark:text-cream/50 animate-pulse">Memuat halaman...</div>}>
              <About />
            </Suspense>
          } />
          <Route path="/blog/contact" element={
            <Suspense fallback={<div className="p-8 text-center mt-20 text-dark/50 dark:text-cream/50 animate-pulse">Memuat halaman...</div>}>
              <Contact />
            </Suspense>
          } />
          <Route path="/blog/:slug" element={
            <Suspense fallback={<div className="p-8 text-center mt-20 text-dark/50 dark:text-cream/50 animate-pulse">Memuat artikel...</div>}>
              <BlogDetail />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/blog/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
