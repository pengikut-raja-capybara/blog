import type { PropsWithChildren } from 'react';
import SiteHeader from './SiteHeader';

function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#fef3c7_0,#fafaf9_45%,#f5f5f4_100%)] text-stone-900">
      <SiteHeader />
      {children}
    </div>
  );
}

export default AppLayout;