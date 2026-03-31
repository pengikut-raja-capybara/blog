function Contact() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
        Kontak
      </p>
      <h1 className="mt-3 text-4xl font-black text-stone-900 md:text-5xl">
        Hubungi Kerajaan Capybara
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700 md:text-lg">
        Untuk kolaborasi konten, pertanyaan editorial, atau masukan fitur, gunakan kanal resmi
        berikut.
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-sm">
        <ul className="space-y-3 text-sm text-stone-700">
          <li>
            Email: <a className="font-medium text-amber-700 hover:underline" href="mailto:rajacapybara275@gmail.com">rajacapybara275@gmail.com</a>
          </li>
          <li>
            GitHub: <a className="font-medium text-amber-700 hover:underline" href="https://github.com/pengikut-raja-capybara" target="_blank" rel="noreferrer">github.com/pengikut-raja-capybara</a>
          </li>
        </ul>
      </section>
    </main>
  );
}

export default Contact;
