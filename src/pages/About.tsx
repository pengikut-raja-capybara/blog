import { Gem, Handshake, Leaf, Wrench, Sparkles, Terminal } from 'lucide-react';
import { SeoMeta } from '../components/seo';

function About() {
  return (
    <div className="flex flex-col gap-16 md:gap-32 mb-24 font-sans max-w-7xl mx-auto px-4 md:px-6">
      <SeoMeta
        title="Tentang Kami"
        description="Pelajari filosofi kerja Pengikut Raja Capybara: kolaborasi tanpa ego, arsitektur terukur, dan engineering berkelanjutan."
        path="/blog/about"
      />

      {/* Header Section with Glassmorphism */}
      <header className="relative pt-24 pb-16 md:pt-36 md:pb-24 overflow-hidden rounded-3xl mt-6 bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-light/20 dark:bg-light/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber/20 dark:bg-amber/10 blur-[80px] rounded-full -z-10 pointer-events-none" />
        
        <div className="text-center max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10 text-sm font-semibold mb-8 text-dark dark:text-dark-text backdrop-blur-sm cursor-default transition-transform hover:scale-105 hover:bg-dark/10 dark:hover:bg-dark-text/10">
            <Sparkles size={16} className="text-amber animate-pulse" />
            <span className="tracking-wide">Kisah & Filosofi</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-dark dark:text-dark-text mb-6 tracking-tight">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-br from-light to-amber">Kami.</span>
          </h1>
          <p className="text-xl md:text-2xl text-dark/80 dark:text-dark-text/80 font-medium italic max-w-2xl mx-auto mb-10 leading-relaxed">
            "Membangun dengan Hati, Berbagi dengan Ketenangan."
          </p>

          <div className="max-w-3xl mx-auto text-dark/75 dark:text-dark-text/75 text-center">
            <p className="leading-relaxed mb-0 font-medium text-lg md:text-xl">
              <strong className="text-dark dark:text-dark-text">Pengikut Raja Capybara</strong> bukanlah sekadar organisasi teknologi biasa. Kami adalah komunitas kolektif pengembang, desainer, dan pemikir yang disatukan oleh visi untuk membangun teknologi sebagai bentuk dedikasi yang tulus bagi kemanusiaan.
            </p>
          </div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section className="scroll-mt-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-dark/10 dark:border-dark-text/10 pb-8 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-dark dark:text-dark-text flex items-center gap-4 tracking-tight">
              <Terminal className="text-amber" size={40} />
              Filosofi Budaya Kerja
            </h2>
            <p className="text-dark/60 dark:text-dark-text/60 mt-3 font-medium text-lg md:text-xl">Standar kerja kolektif berlandaskan ketenangan Sang Raja</p>
          </div>
        </div>

        <p className="text-lg md:text-xl text-dark/80 dark:text-dark-text/80 mb-12 max-w-4xl leading-relaxed text-center sm:text-left mx-auto sm:mx-0">
          Kami percaya bahwa produktivitas sejati tidak lahir dari tekanan, melainkan dari keseimbangan antara fokus yang disiplin dan pendekatan yang bijaksana. Terinspirasi oleh sifat <strong className="text-light">Raja Capybara</strong> yang tenang namun konsisten.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              icon: <Leaf size={28} />,
              title: 'Continuous Engineering',
              desc: 'Kami mengutamakan clean code dan keterbacaan untuk meminimalkan beban teknis jangka panjang bagi komunitas.'
            },
            {
              icon: <Handshake size={28} />,
              title: 'Kolaborasi Tanpa Ego',
              desc: 'Menjalankan code review yang mendalam dan feedback loop yang suportif untuk menjaga keharmonisan standar tim.'
            },
            {
              icon: <Wrench size={28} />,
              title: 'Arsitektur Terukur',
              desc: 'Menerapkan kesederhanaan dalam desain untuk memastikan setiap sistem yang kami bangun tetap mudah dirawat oleh siapapun.'
            },
            {
              icon: <Gem size={28} />,
              title: 'Restorasi Kolektif',
              desc: 'Menghargai waktu istirahat sebagai bagian integral dari proses kreatif demi menjaga kejernihan berpikir seluruh anggota.'
            }
          ].map((item, i) => (
             <div key={i} className="group relative flex flex-col p-8 rounded-3xl bg-cream/50 dark:bg-dark-bg/50 border border-dark/10 dark:border-dark-text/10 hover:border-light/50 dark:hover:border-light/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(245,241,234,0.05)] hover:-translate-y-1 overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                 {item.icon}
               </div>
               <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-light/10 text-light dark:bg-light/20 dark:text-light mb-6 shadow-sm border border-light/20 group-hover:bg-light group-hover:text-cream transition-colors">
                 {item.icon}
               </div>
               <h3 className="text-2xl lg:text-3xl font-black text-dark dark:text-dark-text mb-4 group-hover:text-light transition-colors tracking-tight">{item.title}</h3>
               <p className="text-lg leading-relaxed text-dark/70 dark:text-dark-text/70">{item.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-5xl mx-auto w-full px-4 md:px-0">
        <blockquote className="relative p-10 md:p-16 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-light to-dark text-cream shadow-xl text-center overflow-hidden border border-light/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber/20 via-transparent to-transparent pointer-events-none" />
          <p className="relative z-10 text-2xl md:text-4xl font-bold leading-normal md:leading-snug italic mb-10 max-w-4xl mx-auto">
            "Di tangan yang tepat, ilmu pengetahuan akan selalu membawa kedamaian. Kami membangun bukan untuk pengakuan, tapi untuk kebermanfaatan yang tulus selaras dengan budi luhur Sang Raja."
          </p>
          <div className="relative z-10 flex items-center justify-center gap-4">
             <div className="h-1 w-16 bg-amber/50 rounded-full"></div>
             <span className="text-sm md:text-base font-bold uppercase tracking-widest text-amber">Manifesto Capybara</span>
             <div className="h-1 w-16 bg-amber/50 rounded-full"></div>
          </div>
        </blockquote>
      </section>
      
      <div className="text-center pt-8 mb-8 border-t border-dark/10 dark:border-dark-text/10 max-w-3xl mx-auto mt-8">
        <p className="text-sm md:text-base uppercase tracking-widest font-black text-light/70 dark:text-light flex items-center justify-center gap-3">
           <Sparkles size={18} className="text-amber" /> Berenang dengan tenang di lautan kode <Sparkles size={18} className="text-amber" />
        </p>
      </div>

    </div>
  );
}

export default About;