function About() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Tentang Kami
      </p>
      <h1 className="mt-3 text-4xl font-black text-stone-900 md:text-5xl">
        Pengikut Raja Capybara
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700 md:text-lg">
        Blog ini adalah ruang belajar hidup lambat: menulis tentang alam, strategi tenang,
        dan budaya kerajaan capybara dalam bentuk yang ringkas serta mudah dipraktikkan.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">Misi</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Menyajikan artikel yang bermanfaat, akurat, dan nyaman dibaca dari berbagai
            perangkat.
          </p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">Nilai</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Ketenangan, kejernihan berpikir, dan konsistensi membagikan pengetahuan secara
            terbuka.
          </p>
        </article>
      </section>
    </main>
  );
}

export default About;
