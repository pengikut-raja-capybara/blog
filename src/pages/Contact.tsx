import { useState } from "react";
import { GitMerge, Mail } from "lucide-react";

function Contact() {
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
    console.log("Pesan Terkirim:", formData);
    alert("Pesan Anda telah diterima oleh Sang Raja. Kami akan membalas dengan tenang.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <article className="max-w-5xl mx-auto py-10 px-6 text-dark dark:text-dark-text">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Sisi Kiri: Narasi & Info */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-dark-text mb-6">Mari Berdiskusi</h1>
          <p className="text-lg text-dark/70 dark:text-dark-text/75 mb-8 leading-relaxed">
            Apakah Anda ingin berkolaborasi, bertanya tentang proyek open source kami, atau sekadar menyapa? Pintu markas kami selalu terbuka untuk percakapan yang bermanfaat.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/35 rounded-full flex items-center justify-center text-green-700 dark:text-green-300">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Email</p>
                <a href="mailto:rajacapybara275@gmail.com" className="text-dark dark:text-dark-text hover:text-green-700 dark:hover:text-green-300 transition-colors">
                  rajacapybara275@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/35 rounded-full flex items-center justify-center text-green-700 dark:text-green-300">
                <GitMerge className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">GitHub</p>
                <a href="https://github.com/pengikut-raja-capybara" target="_blank" rel="noreferrer" className="text-dark dark:text-dark-text hover:text-green-700 dark:hover:text-green-300 transition-colors">
                  github.com/pengikut-raja-capybara
                </a>
              </div>
            </div>
          </div>

          <p className="mt-12 text-sm italic text-dark/50 dark:text-dark-text/50">*Kami membalas pesan dengan ritme yang tenang, biasanya dalam 1-2 hari kerja.</p>
        </div>

        {/* Sisi Kanan: Formulir */}
        <div className="bg-white dark:bg-dark-bg-light/40 p-8 rounded-2xl shadow-xl shadow-dark/10 dark:shadow-black/30 border border-dark/10 dark:border-white/15">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-dark dark:text-dark-text mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-white/20 bg-white dark:bg-dark-bg-light/70 text-dark dark:text-dark-text placeholder:text-dark/45 dark:placeholder:text-dark-text/45 focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all"
                placeholder="Siapa nama Anda?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark dark:text-dark-text mb-2">Alamat Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-white/20 bg-white dark:bg-dark-bg-light/70 text-dark dark:text-dark-text placeholder:text-dark/45 dark:placeholder:text-dark-text/45 focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark dark:text-dark-text mb-2">Pesan Anda</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-white/20 bg-white dark:bg-dark-bg-light/70 text-dark dark:text-dark-text placeholder:text-dark/45 dark:placeholder:text-dark-text/45 focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Ceritakan apa yang bisa kita bangun bersama..."
              />
            </div>

            <button type="submit" className="w-full py-4 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/25 dark:shadow-green-900/35 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 dark:focus-visible:ring-green-300 dark:focus-visible:ring-offset-dark-bg-light">
              Kirim Pesan Sekarang
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export default Contact;
