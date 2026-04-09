import { useState } from "react";
import { GitMerge, Mail, Send, MessageSquare } from "lucide-react";
import { SeoMeta } from '../components/seo';

function Contact() {
  const whatsappNumber = '6285157725864';
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const whatsappMessage = [
      'Halo Raja Capybara,',
      `Perkenalkan, diri ini *${formData.name}* dengan email *${formData.email}*, ingin menghubungi Anda melalui WhatsApp untuk berdiskusi tentang:`,
      '',
      formData.message,
    ].join('\n');

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col gap-16 md:gap-32 mb-24 font-sans max-w-7xl mx-auto px-4 md:px-6">
      <SeoMeta
        title="Kontak"
        description="Hubungi Pengikut Raja Capybara untuk kolaborasi, diskusi proyek open source, atau konsultasi teknis."
        path="/blog/contact"
      />

      {/* Header Section */}
      <header className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden rounded-3xl mt-6 bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-light/10 dark:bg-light/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber/10 dark:bg-amber/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
        
        <div className="text-center max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark/5 dark:bg-dark-text/5 border border-dark/10 dark:border-dark-text/10 text-sm font-semibold mb-8 text-dark dark:text-dark-text backdrop-blur-sm cursor-default transition-transform hover:scale-105 hover:bg-dark/10 dark:hover:bg-dark-text/10">
            <MessageSquare size={16} className="text-amber" />
            <span className="tracking-wide">Hubungi Kami</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-dark dark:text-dark-text mb-6 tracking-tight">
            Mari <span className="text-transparent bg-clip-text bg-gradient-to-br from-light to-amber">Berdiskusi.</span>
          </h1>
          <p className="text-lg md:text-2xl text-dark/70 dark:text-dark-text/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Apakah Anda ingin berkolaborasi, bertanya tentang proyek open source kami, atau sekadar menyapa? Pintu markas kami selalu terbuka.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
        {/* Sisi Kiri: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="text-3xl font-black text-dark dark:text-dark-text mb-4 tracking-tight">Saluran Komunikasi</h2>
            <p className="text-lg text-dark/70 dark:text-dark-text/70 leading-relaxed mb-8">
              Kami menyambut percakapan yang membangun dan kolaborasi tanpa ego. Pilihlah saluran komunikasi yang paling nyaman bagi Anda.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-5 group p-4 rounded-2xl bg-dark/5 dark:bg-dark-text/5 border border-transparent hover:border-dark/10 dark:hover:border-dark-text/10 transition-all">
                <div className="w-14 h-14 rounded-xl bg-cream dark:bg-dark-bg border border-dark/10 dark:border-dark-text/10 flex items-center justify-center text-light dark:text-light group-hover:-rotate-6 transition-transform shadow-sm">
                  <Mail className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber uppercase tracking-wider mb-1">Email</p>
                  <a href="mailto:rajacapybara275@gmail.com" className="text-dark dark:text-dark-text font-bold hover:text-light dark:hover:text-light transition-colors text-lg">
                    rajacapybara275@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-5 group p-4 rounded-2xl bg-dark/5 dark:bg-dark-text/5 border border-transparent hover:border-dark/10 dark:hover:border-dark-text/10 transition-all">
                <div className="w-14 h-14 rounded-xl bg-cream dark:bg-dark-bg border border-dark/10 dark:border-dark-text/10 flex items-center justify-center text-light dark:text-light group-hover:rotate-6 transition-transform shadow-sm">
                  <GitMerge className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber uppercase tracking-wider mb-1">GitHub</p>
                  <a href="https://github.com/pengikut-raja-capybara" target="_blank" rel="noreferrer" className="text-dark dark:text-dark-text font-bold hover:text-light dark:hover:text-light transition-colors text-lg">
                    pengikut-raja-capybara
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-amber/10 dark:bg-amber/5 border border-amber/20 dark:border-amber/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-amber/20 blur-2xl rounded-full" />
              <p className="text-sm italic text-dark/80 dark:text-dark-text/80 leading-relaxed font-medium">
                *Kami membalas pesan dengan ritme yang tenang, biasanya dalam 1-2 hari kerja. Kualitas diskusi jauh lebih kami utamakan daripada sekadar balasan cepat.
              </p>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Formulir Glassmorphism */}
        <div className="lg:col-span-3 bg-cream/50 dark:bg-dark-text/5 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-dark/10 dark:border-dark-text/10 backdrop-blur-md relative overflow-hidden group/form">
          <div className="absolute top-0 right-0 w-48 h-48 bg-light/10 blur-[60px] rounded-full -z-10 pointer-events-none transition-all group-hover/form:bg-light/20" />
          
          <h3 className="text-3xl font-black text-dark dark:text-dark-text mb-8 tracking-tight">Kirim Transmisi Pesan</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-dark/80 dark:text-dark-text/80 mb-2 uppercase tracking-widest pl-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl border border-dark/10 dark:border-dark-text/10 bg-white/70 dark:bg-dark-bg/60 text-dark dark:text-dark-text placeholder:text-dark/40 dark:placeholder:text-dark-text/40 focus:ring-2 focus:ring-light/50 focus:border-light outline-none transition-all shadow-sm"
                placeholder="Siapa nama Anda?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/80 dark:text-dark-text/80 mb-2 uppercase tracking-widest pl-1">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl border border-dark/10 dark:border-dark-text/10 bg-white/70 dark:bg-dark-bg/60 text-dark dark:text-dark-text placeholder:text-dark/40 dark:placeholder:text-dark-text/40 focus:ring-2 focus:ring-light/50 focus:border-light outline-none transition-all shadow-sm"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark/80 dark:text-dark-text/80 mb-2 uppercase tracking-widest pl-1">
                Pesan Anda
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-5 py-4 rounded-2xl border border-dark/10 dark:border-dark-text/10 bg-white/70 dark:bg-dark-bg/60 text-dark dark:text-dark-text placeholder:text-dark/40 dark:placeholder:text-dark-text/40 focus:ring-2 focus:ring-light/50 focus:border-light outline-none transition-all resize-none shadow-sm"
                placeholder="Ceritakan apa yang bisa kita bangun bersama..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-5 px-6 bg-dark dark:bg-dark-text text-cream dark:text-dark font-black rounded-2xl shadow-lg shadow-dark/20 dark:shadow-dark-text/10 transition-all hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-3 group mt-6 text-lg tracking-wide"
            >
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Kirim via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
