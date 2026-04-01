import { Gem, Handshake, Leaf, Wrench } from 'lucide-react';

function About() {
  return (
    <article className="max-w-4xl mx-auto py-16 px-6 text-dark dark:text-dark-text">
      {/* Header Organisasi */}
      <header className="mb-16 border-b border-dark/10 dark:border-emerald-200/15 pb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-dark dark:text-dark-text mb-6 tracking-tighter uppercase">
          Tentang Kami
        </h1>
        <p className="text-2xl text-green-700 dark:text-emerald-300 font-medium italic">
          "Membangun dengan Hati, Berbagi dengan Ketenangan."
        </p>
      </header>

      <div className="prose prose-stone dark:prose-invert lg:prose-xl max-w-none prose-p:text-dark/80 dark:prose-p:text-dark-text/85 prose-strong:text-dark dark:prose-strong:text-dark-text">
        <p className="leading-relaxed text-center max-w-3xl mx-auto mb-12 text-dark/85 dark:text-dark-text/90">
          <strong>Pengikut Raja Capybara</strong> bukanlah sekadar organisasi teknologi biasa. 
          Kami adalah komunitas kolektif pengembang, desainer, dan pemikir yang disatukan oleh visi untuk membangun teknologi 
          sebagai bentuk dedikasi yang tulus bagi kemanusiaan.
        </p>

        <h2 className="text-3xl font-black border-l-8 border-green-700 dark:border-emerald-400 pl-4 mb-8 text-dark dark:text-dark-text">
          Filosofi Budaya Kerja
        </h2>
        <p className="text-dark/80 dark:text-dark-text/85">
          Kami percaya bahwa produktivitas sejati tidak lahir dari tekanan, melainkan dari keseimbangan antara fokus yang disiplin 
          dan pendekatan yang bijaksana. Terinspirasi oleh sifat <strong>Raja Capybara</strong> yang tenang namun konsisten, 
          organisasi kami mengadopsi standar kerja kolektif berikut:
        </p>

        <ul className="not-prose my-12 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 md:items-stretch">
          <li className="flex h-full flex-col rounded-3xl border border-dark/8 bg-white/90 p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.55)] transition-colors dark:border-emerald-300/20 dark:bg-emerald-950/65 dark:shadow-[0_16px_32px_-24px_rgba(16,185,129,0.45)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              <Leaf size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-3xl font-black leading-tight text-dark dark:text-dark-text">Continuous Engineering</h3>
            <p className="mt-4 text-lg leading-relaxed text-dark/75 dark:text-dark-text/80">Kami mengutamakan <em>clean code</em> dan keterbacaan untuk meminimalkan beban teknis jangka panjang bagi komunitas.</p>
          </li>
          <li className="flex h-full flex-col rounded-3xl border border-dark/8 bg-white/90 p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.55)] transition-colors dark:border-emerald-300/20 dark:bg-emerald-950/65 dark:shadow-[0_16px_32px_-24px_rgba(16,185,129,0.45)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              <Handshake size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-3xl font-black leading-tight text-dark dark:text-dark-text">Kolaborasi Tanpa Ego</h3>
            <p className="mt-4 text-lg leading-relaxed text-dark/75 dark:text-dark-text/80">Menjalankan <em>code review</em> yang mendalam dan <em>feedback loop</em> yang suportif untuk menjaga keharmonisan standar tim.</p>
          </li>
          <li className="flex h-full flex-col rounded-3xl border border-dark/8 bg-white/90 p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.55)] transition-colors dark:border-emerald-300/20 dark:bg-emerald-950/65 dark:shadow-[0_16px_32px_-24px_rgba(16,185,129,0.45)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              <Wrench size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-3xl font-black leading-tight text-dark dark:text-dark-text">Arsitektur Terukur</h3>
            <p className="mt-4 text-lg leading-relaxed text-dark/75 dark:text-dark-text/80">Menerapkan kesederhanaan dalam desain untuk memastikan setiap sistem yang kami bangun tetap mudah dirawat oleh siapapun.</p>
          </li>
          <li className="flex h-full flex-col rounded-3xl border border-dark/8 bg-white/90 p-6 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.55)] transition-colors dark:border-emerald-300/20 dark:bg-emerald-950/65 dark:shadow-[0_16px_32px_-24px_rgba(16,185,129,0.45)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-200">
              <Gem size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-3xl font-black leading-tight text-dark dark:text-dark-text">Restorasi Kolektif</h3>
            <p className="mt-4 text-lg leading-relaxed text-dark/75 dark:text-dark-text/80">Menghargai waktu istirahat sebagai bagian integral dari proses kreatif demi menjaga kejernihan berpikir seluruh anggota.</p>
          </li>
        </ul>

        <blockquote className="bg-green-50 dark:bg-emerald-950/35 p-8 rounded-3xl border border-green-200/70 dark:border-emerald-200/15 italic text-dark/80 dark:text-dark-text/85 text-center my-12">
          "Di tangan yang tepat, ilmu pengetahuan akan selalu membawa kedamaian. Kami membangun bukan untuk pengakuan, 
          tapi untuk kebermanfaatan yang tulus selaras dengan budi luhur Sang Raja."
        </blockquote>

        <div className="text-center pt-10 border-t border-dark/5 dark:border-emerald-200/15">
          <p className="text-sm uppercase tracking-widest font-black text-green-700 dark:text-emerald-300">
            Berenang dengan tenang di lautan kode.
          </p>
        </div>
      </div>
    </article>
  );
}

export default About;