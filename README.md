# Pengikut Raja Capybara Blog

Blog SPA berbasis React + Vite yang mengambil konten dari repository CMS (JSON) dan dipublikasikan ke GitHub Pages.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Vitest + Testing Library

## Route Aplikasi

Aplikasi menggunakan base path `/blog`:

- `/blog/` -> Home (list artikel)
- `/blog/about` -> Tentang
- `/blog/contact` -> Kontak
- `/blog/:slug` -> Detail artikel

Konfigurasi route ada di `src/App.tsx`.

## Sumber Konten (CMS)

Konten diambil dari repo CMS:

- Owner: `pengikut-raja-capybara`
- Repo: `blog`
- Branch: `content`
- Folder post: `content/posts`

Konfigurasi ada di `src/features/blog/config/cmsSource.ts`.

## Menjalankan Lokal

Install dependency:

```bash
bun install
```

Menjalankan dev server:

```bash
bun run dev
```

Build production:

```bash
bun run build
```

Preview build:

```bash
bun run preview
```

## Script Penting

- `bun run dev` -> jalankan mode development
- `bun run build` -> build production
- `bun run lint` -> lint source
- `bun run test` -> jalankan test sekali
- `bun run test:watch` -> test mode watch
- `bun run sitemap:generate` -> generate `sitemap.xml`
- `bun run spa:routes` -> generate static route files untuk deep-link + preview crawler

## SEO dan Sitemap

Project sudah menyiapkan:

- Metadata SEO per halaman
- `sitemap.xml` otomatis
- Static HTML route per slug untuk crawler/in-app preview (mis. WhatsApp)

Generator terkait:

- `scripts/generate-sitemap.mjs`
- `scripts/generate-spa-routes.mjs`

## GitHub Actions

### 1) Deploy utama

File: `.github/workflows/deploy.yml`

Trigger:

- Push ke `main`
- Manual (`workflow_dispatch`)

Pipeline:

1. Install dependency
2. Build aplikasi
3. Generate sitemap
4. Generate SPA route files
5. Deploy ke branch `gh-pages`

### 2) Sinkronisasi berkala (cron)

File: `.github/workflows/sync-content-cron.yml`

Trigger:

- Tiap 3 hari (`15 0 */3 * *`)
- Manual (`workflow_dispatch`)

Pipeline sama dengan deploy utama: build + sitemap + SPA routes + publish ke `gh-pages`.

## Variable yang Perlu Disiapkan

Di GitHub repository settings -> Secrets and variables -> Actions -> Variables:

- `SITE_URL`

Contoh nilai:

`https://pengikut-raja-capybara.github.io`

Catatan: jangan tambahkan `/blog` di `SITE_URL` karena base path sudah ditangani oleh workflow.

## Catatan Deploy GitHub Pages

- Branch publish: `gh-pages`
- App base path: `/blog`
- Static route files dibuat otomatis agar direct access URL slug tetap terbuka

## Testing

Jalankan semua test:

```bash
bun run test
```

Jalankan test pages saja:

```bash
bun run test src/pages
```
