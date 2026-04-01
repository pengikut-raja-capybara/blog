import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useDarkMode } from '../../hooks/useDarkMode';

const primaryNavLinks = [
  { label: 'Blog', to: '/blog/' },
  { label: 'Tentang', to: '/blog/about' },
  { label: 'Kontak', to: '/blog/contact' },
];

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }

  if (pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/+$/, '');
}

function SiteHeader() {
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();
  const [now, setNow] = useState(() => new Date());
  const normalizedCurrentPath = normalizePathname(location.pathname);

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [],
  );

  const timeLabel = useMemo(() => {
    const parts = timeFormatter.formatToParts(now);
    const hour = parts.find((part) => part.type === 'hour')?.value ?? '--';
    const minute = parts.find((part) => part.type === 'minute')?.value ?? '--';
    const second = parts.find((part) => part.type === 'second')?.value ?? '--';
    const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value;
    const baseTime = `${hour}:${minute}:${second}`;

    return dayPeriod ? `${baseTime} ${dayPeriod}` : baseTime;
  }, [now, timeFormatter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/70 dark:bg-dark-bg/70 backdrop-blur-xl border-b border-dark/5 dark:border-white/5 transition-all duration-500">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12 py-5">
        
        {/* Identitas Brand */}
        <Link 
          className="flex items-center gap-3 group transition-transform active:scale-95" 
          to="/"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full group-hover:bg-green-500/40 transition-colors" />
            <img 
              src={logoImg} 
              alt="Raja Capybara Logo" 
              className="relative w-10 h-10 object-contain drop-shadow-sm" 
            />
          </div>
          <span className="hidden md:inline text-xl font-black tracking-tighter text-dark dark:text-dark-text uppercase">
            Pengikut Raja Capybara
          </span>
        </Link>

        {/* Navigasi Utama */}
        <nav className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-dark/5 dark:bg-white/5 p-1 rounded-full border border-dark/5 dark:border-white/5">
            {primaryNavLinks.map((link) => {
              const isActive = normalizedCurrentPath === normalizePathname(link.to);
              return (
                <Link 
                  key={link.to} 
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-white dark:bg-dark-bg-light text-green-700 dark:text-green-400 shadow-sm' 
                      : 'text-dark/50 dark:text-dark-text/50 hover:text-dark dark:hover:text-dark-text'
                  }`}
                  to={link.to}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="h-6 w-[1px] bg-dark/10 dark:bg-white/10 mx-2 hidden sm:block" />

          <time
            dateTime={now.toISOString()}
            className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl border border-dark/10 dark:border-white/15 bg-white/75 dark:bg-dark-bg-light/55 text-sm font-semibold tabular-nums text-dark/80 dark:text-dark-text/80 shadow-sm"
            aria-label="Waktu saat ini"
          >
            {timeLabel}
          </time>

          {/* Toggle Mode Gelap */}
          <button
            onClick={toggle}
            className="p-3 rounded-full bg-dark/5 dark:bg-white/5 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 group"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-dark/70 group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;