import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import SiteHeader from './SiteHeader';

function AppLayout() {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') {
      return;
    }

    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-cream dark:bg-dark-bg text-dark dark:text-dark-text transition-colors duration-300">
      <SiteHeader />
      <main
        className={
          isAboutPage
            ? 'flex-grow pt-20'
            : 'flex-grow px-4 pb-16 pt-24 sm:px-6 lg:px-8'
        }
      >
        <div className={isAboutPage ? '' : 'mx-auto max-w-7xl'}>
          <div key={location.pathname} className="route-transition-enter">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="bg-cream dark:bg-dark-bg border-t border-tan/20 dark:border-dark-bg-light/30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-dark/60 dark:text-dark-text/60">
          Berenang dengan tenang di lautan kode. © 2026 Pengikut Raja Capybara.
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;