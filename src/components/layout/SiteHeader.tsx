import { Link } from 'react-router';

const primaryNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'Tentang', to: '/about' },
  { label: 'Kontak', to: '/contact' },
];

function SiteHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-white/65 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link className="text-sm font-black tracking-wide text-stone-900" to="/">
          Pengikut Raja Capybara
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-stone-700">
          {primaryNavLinks.map((link) => (
            <Link key={link.to} className="hover:text-amber-700" to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;