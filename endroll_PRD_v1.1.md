# endroll

**Your personal film & series journal**  
**Product Requirements Document (PRD)**  
**Versi:** 1.1  
**Tanggal:** Juni 2026

---

## Daftar Isi

1. [Overview Produk](#1-overview-produk)
2. [Target Pengguna](#2-target-pengguna)
3. [Fitur & Scope](#3-fitur--scope)
4. [Sistem Rating](#4-sistem-rating)
5. [Sistem Streak](#5-sistem-streak)
6. [Onboarding Flow](#6-onboarding-flow)
7. [Error Handling](#7-error-handling)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Prinsip Desain & UX](#9-prinsip-desain--ux)
10. [Tech Stack & Arsitektur](#10-tech-stack--arsitektur)
11. [Metrics & Success Criteria](#11-metrics--success-criteria)
12. [Scope v1.0](#12-scope-v10)
13. [Strategi Monetisasi](#13-strategi-monetisasi-roadmap)
14. [Risiko & Mitigasi](#14-risiko--mitigasi)
15. [Timeline & Milestones](#15-timeline--milestones)
16. [Open Questions](#16-open-questions)

---

## 1. Overview Produk

### 1.1 Visi

Endroll adalah platform personal journaling untuk film dan series — sebuah ruang milik pengguna sendiri, bukan showcase untuk orang lain. Di tengah era overload konten streaming, Endroll hadir sebagai tempat yang membantu pengguna mencatat, merefleksikan, dan merayakan pengalaman menonton mereka dengan cara yang indah dan terasa personal.

### 1.2 Problem Statement

Masalah utama yang Endroll selesaikan:

- Banyak pengguna mencatat tontonan di Notes app atau spreadsheet biasa, yang berantakan dan tidak memiliki struktur yang memuaskan.
- Platform yang ada seperti Letterboxd, IMDb, atau Trakt terlalu berorientasi komunitas dan sosial, sehingga terasa seperti “performance” bukan “journaling”.
- Tidak ada platform yang memberikan rasa kepuasan personal — statistik yang terasa milik sendiri, visual yang bisa dikustomisasi, dan organisasi yang fleksibel sesuai selera tiap orang.
- Pengguna kehilangan memori emosional dari tontonan mereka — tidak ada cara mudah untuk mengingat kembali “kapan saya nonton ini” atau “apa yang saya rasakan saat itu”.

### 1.3 Proposisi Nilai

| Untuk Siapa | Kategori | Diferensiasi | Platform |
|---|---|---|---|
| Film & series enthusiast | Personal journaling | Privacy-first, highly personal | Web, mobile-first |

---

## 2. Target Pengguna

### 2.1 Segmen Utama

#### Segment A — The Mindful Watcher

**Usia:** 18–30  
Pengguna yang menonton dengan intensional. Mereka memilih film dengan cermat, mau menulis ulasan pendek, dan ingin koleksi tontonan mereka terlihat curated. Sering aktif di media sosial tetapi menginginkan “jurnal pribadi” yang tidak perlu dibagikan ke orang lain.

#### Segment B — The Power Tracker

**Usia:** 22–35  
Pengguna yang suka data. Mereka ingin tahu sudah berapa film yang ditonton tahun ini, genre favorit mereka apa, berapa jam yang dihabiskan. Mendapatkan kepuasan dari statistik dan streak yang terus bertambah.

#### Segment C — The Casual Collector

**Usia:** 16–28  
Pengguna yang tidak terlalu intensional tetapi ingin “tempat menyimpan” apa yang sudah dan ingin ditonton. Menggunakan fitur watchlist paling sering. Tidak terlalu suka menulis, tetapi suka visual yang bagus.

### 2.2 User Persona Utama

| Atribut | Dara, 24 — Mahasiswa Desain | Rizky, 28 — Software Engineer |
|---|---|---|
| Kebiasaan Nonton | Nonton 3–5 film per minggu, suka nonton sendirian di malam hari. | Nonton series sambil kerja, suka data dan statistik. |
| Pain Point | Daftar tontonan di Notes app berantakan, tidak bisa di-organize. | Letterboxd terlalu sosial, ingin tracking lebih detail dan privat. |
| Keinginan | Tempat yang indah untuk menyimpan film favorit dengan notes personal. | Dashboard statistik, streak, dan analisis genre yang dalam. |
| Fitur Favorit | Collections, notes pribadi, profil yang bisa dikustomisasi. | Streak, statistik, export data. |

---

## 3. Fitur & Scope

Keterangan prioritas:

- **P0:** MVP wajib ada
- **P1:** Penting untuk launch
- **P2:** Nice-to-have
- **P3:** Roadmap jangka panjang

### 3.1 Core Features — MVP (P0)

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Diary Tontonan | Log film/series yang sudah ditonton dengan tanggal, rating 0.0–10.0 satu desimal, dan notes bebas. | P0 |
| Watchlist | Daftar film/series yang ingin ditonton. Bisa add, remove, dan mark as watched. | P0 |
| Rating & Review | Rating desimal 0.0–10.0, contoh 8.7 atau 6.5, dengan catatan pribadi. Tidak publik secara default. | P0 |
| Search & Add | Cari film/series via integrasi TMDb API. Data otomatis terisi, seperti poster, tahun, genre, dan cast. | P0 |
| Film Manual | Tambah film tanpa data TMDb jika tidak ditemukan — input judul, tahun, genre secara manual. | P0 |
| User Account | Registrasi dan login via email atau Google OAuth. Data tersimpan per akun. | P0 |
| Profil Personal | Halaman profil dengan statistik dasar dan film terbaru yang ditonton. | P0 |

### 3.2 Series Tracking

Endroll mendukung tracking series dengan tiga level kedalaman. User memilih sesuai preferensi mereka:

- **Level 1 (default):** Log show secara keseluruhan. Status: Watching, Completed, Dropped. Cocok untuk Segment C.
- **Level 2:** Log per season. Rating dan notes per season. Cocok untuk pengguna yang lebih intentional.
- **Level 3 (P2):** Log per episode. Untuk superfan. Infrastruktur database harus siap dari awal meski UI-nya belum tersedia di v1.0.

> **Catatan database:** Tabel `titles` menggunakan kolom `type` (`film` / `series`). Tabel `watch_logs` mendukung referensi opsional ke `season_number` dan `episode_number` untuk Level 2 dan Level 3.

### 3.3 Engagement Features (P1)

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Streak Nonton | Weekly streak — bertambah jika ada minimal 1 log dalam seminggu kalender Senin–Minggu. Grace period 1 hari di awal minggu berikutnya. | P1 |
| Collections | Buat koleksi tematik custom: “Film Hujan”, “Nonton Bareng Mama”, dan lain-lain. Bebas nama dan deskripsi. | P1 |
| Statistik Personal | Dashboard: total film, total jam, genre favorit, director favorit, dekade terbanyak, rating rata-rata. Termasuk agregasi data director dan cast dari TMDb. | P1 |
| Mood/Konteks Tag | Tag konteks nonton: sendiri, bareng teman, malam, mood sedih, di bioskop, dan sebagainya. | P1 |
| Rewatch Tracking | Tandai film yang sudah ditonton lebih dari sekali, catat tanggal rewatch. Rewatch dihitung valid untuk streak. | P1 |
| Director & Aktor Tracking | Dari data TMDb yang ada, tampilkan otomatis: “Kamu sudah nonton 7 film Christopher Nolan.” Tidak butuh infrastruktur baru. | P1 |

### 3.4 Polish & Personalization (P2)

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Wrapped Tahunan | Ringkasan akhir tahun bergaya Spotify Wrapped — film terbanyak, genre favorit, momen terbaik. | P2 |
| “On This Day” | Notifikasi atau widget: “2 tahun lalu kamu menonton Parasite.” Memperkuat positioning Endroll sebagai arsip emosional. | P2 |
| Watchlist Expiry | Film yang di-watchlist lebih dari 90 hari muncul di section “Sudah lama nunggu” — gentle reminder tanpa tekanan. | P2 |
| Custom List Sorting | Sort koleksi/watchlist berdasarkan rating, tanggal, judul, atau drag-and-drop manual. | P2 |
| Import dari Letterboxd | Upload CSV export dari Letterboxd untuk import riwayat tontonan. | P2 |
| Tema Visual | Pilih color theme atau mode tampilan profil: dark, light, custom accent color. | P2 |
| Milestone & Badges | Unlock badge saat mencapai milestone: 100 film, streak 30 hari, dan lain-lain. | P2 |

### 3.5 Long-term Roadmap (P3)

| Fitur | Deskripsi | Prioritas |
|---|---|---|
| Shared Collections | Bagikan koleksi ke teman via link view-only. Bukan feed publik. | P3 |
| Rekomendasi AI | Saran film berdasarkan riwayat dan preferensi pengguna. Butuh data yang cukup terlebih dahulu. | P3 |
| Export Data | Export riwayat tontonan ke CSV/JSON. Pengguna memiliki datanya sendiri. | P3 |
| Mobile App | Native app iOS/Android untuk logging cepat setelah selesai nonton. | P3 |
| Notifikasi Pintar | Ingatkan watchlist yang sudah lama tidak ditonton, atau streak hampir putus. | P3 |
| Episode-level Tracking | UI lengkap untuk log per episode pada series Level 3. Infrastruktur sudah siap sejak v1.0. | P3 |

---

## 4. Sistem Rating

### 4.1 Format Rating

Endroll menggunakan sistem rating desimal **0.0–10.0** dengan presisi satu desimal, misalnya 8.7, 6.5, atau 10.0. Sistem ini memberikan ruang ekspresif yang lebih luas dibanding bintang 1–5.

**Alasan:** Rating desimal memungkinkan pengguna mengekspresikan nuansa. Perbedaan antara 7.5 dan 8.0 bermakna, berbeda dengan sistem bintang yang loncat penuh. Ini sesuai dengan positioning Endroll sebagai jurnal personal yang terasa milik sendiri.

### 4.2 Spesifikasi Teknis Rating

- Rentang nilai: `0.0–10.0`
- Presisi: 1 desimal
- Increment UI: slider snap ke `0.5` terdekat
- Input UI: slider horizontal dengan label angka, atau tap-to-set pada mobile
- Tampilan: angka besar, misalnya `8.7`, dengan desimal lebih kecil secara visual
- Rating opsional: user bisa log tanpa memberi rating
- Format simpan di database: `DECIMAL(3,1)` — nilai antara `0.0` dan `10.0`

### 4.3 Rating di Statistik

- Rating rata-rata dihitung dari semua entry yang memiliki rating. Entry tanpa rating tidak diikutkan.
- Rating tertinggi dan terendah ditampilkan di statistik tahunan / Wrapped.
- Distribusi rating ditampilkan sebagai histogram di halaman profil (P1).

---

## 5. Sistem Streak

### 5.1 Definisi Streak

Endroll menggunakan **weekly streak**, bukan daily streak.

**Alasan:** Endroll adalah journaling app untuk film, bukan habit tracker. Orang tidak menonton film setiap hari, dan daily streak akan menciptakan tekanan yang bertentangan dengan tone “calm & personal” Endroll.

### 5.2 Aturan Streak

- 1 minggu = Senin–Minggu (minggu kalender standar)
- Streak bertambah jika ada minimal 1 log entry dalam seminggu
- Grace period: streak belum dianggap putus sampai akhir hari Senin minggu berikutnya
- Rewatch dihitung sebagai entry yang valid untuk streak
- Series: satu episode = satu entry valid untuk streak
- Retroactive logging tidak menghidupkan streak yang sudah mati — hanya untuk mengisi data historis

### 5.3 Tampilan Streak

- Streak counter di profil dan halaman utama: “12 minggu berturut-turut”
- Record streak terpanjang ditampilkan di bawah streak aktif
- Gentle reminder jika minggu berjalan belum ada log, opsional dan bisa dimatikan di settings

---

## 6. Onboarding Flow

Onboarding terdiri dari 7 langkah. Tujuan utama: user berhasil mencatat minimal 1 film sebelum menutup app. Pengguna yang berhasil log 1 film saat onboarding diasumsikan memiliki peluang retensi lebih tinggi.

1. **Splash screen** — Brand + satu CTA utama “Mulai”. Tidak ada form. Tone: calm, personal.
2. **Registrasi** — Email + password atau Google OAuth. Copy menegaskan privacy-first sebelum submit.
3. **Username** — Satu field, minimal friction. Hanya untuk identifikasi akun.
4. **Taste profiling** — Pilih genre favorit multi-select. Bisa dilewati. Data ini mengisi statistik genre sejak awal.
5. **Film pertama** — Search TMDb atau tambah manual. Tombol “Lewati” tersedia tetapi tidak ditonjolkan.
6. **Quick log** — Rating + catatan singkat untuk film yang dipilih. Field catatan opsional.
7. **Dashboard pertama** — Statistik langsung terisi dari film pertama. Streak sudah berjalan. Dua CTA: “Lihat diary” dan “Tambah ke watchlist”.

### Empty States

Setiap halaman yang kosong, seperti diary, watchlist, dan collections, harus punya empty state yang warm dan encouraging — bukan hanya icon kosong.

Contoh copy:

> “Belum ada film di sini. Film apa yang terakhir kamu tonton?”

---

## 7. Error Handling

### 7.1 TMDb & Pencarian Film

#### Film tidak ditemukan di TMDb

- Tampilkan pesan jelas: “Tidak ada hasil untuk [query].”
- Tawarkan opsi “Tambah film manual” — user bisa input judul, tahun, genre tanpa poster.

#### TMDb API down atau timeout >5 detik

- Coba ambil dari cache database lokal jika film pernah di-fetch sebelumnya.
- Tampilkan degraded notice: “Pencarian film sedang lambat.”
- Logging tetap bisa dilakukan.

### 7.2 Duplikasi & Konflik Entry

#### Film sudah ada di diary dan bukan rewatch

Tampilkan dialog konfirmasi:

> “Kamu sudah mencatat [Film] pada [tanggal]. Ini rewatch baru, atau ingin mengedit catatan lama?”

Pilihan:

1. Catat sebagai rewatch baru
2. Edit catatan lama
3. Batal

#### Film di watchlist di-log oleh user

- Auto-hapus dari watchlist setelah log disimpan.
- Tampilkan toast: “[Film] dipindahkan dari watchlist ke diary.”
- Tidak butuh konfirmasi.

#### Film yang sama di dua koleksi

- Diizinkan by design.
- Tampilkan badge “ada di N koleksi” saat hover poster.

### 7.3 Auth & Akun

#### Email sudah terdaftar

- Pesan inline di form, bukan modal.
- Sertakan link langsung ke login dan reset password.

#### Session expired saat menulis catatan

- Simpan draft ke `localStorage` sebelum redirect ke login.
- Setelah login kembali, restore draft otomatis dengan toast: “Catatan kamu tersimpan sementara.”

### 7.4 Koneksi & Network

#### Offline saat mencoba log (MVP)

- Tampilkan error yang jelas dan tombol retry.
- Offline-first full direncanakan untuk v2+.

#### Poster gagal load

- Tampilkan placeholder dengan inisial judul film.
- Warna placeholder di-generate dari hash judul agar tetap terlihat curated, bukan broken.

---

## 8. Accessibility Requirements

Target: **WCAG 2.1 Level AA**. Ini bukan nice-to-have — Endroll adalah app untuk semua orang.

### 8.1 Warna & Kontras

- Kontras teks minimum 4.5:1 terhadap background.
- Palette deep purple/violet harus diverifikasi.
- Rating, streak, dan badge tidak boleh mengandalkan warna saja sebagai satu-satunya penanda.
- Rating bintang, jika digunakan sebagai visual pendamping angka, harus punya aria-label: `8.7 dari 10`.

### 8.2 Keyboard & Fokus

- Semua aksi utama, seperti log film, add watchlist, beri rating, dan buat koleksi, bisa dilakukan tanpa mouse.
- Focus indicator harus terlihat jelas.
- Jangan menyembunyikan focus dengan `outline: none` tanpa pengganti.
- Touch target minimum `44x44px` untuk semua elemen interaktif. Ini kritis karena mobile-first.

### 8.3 Screen Reader & Semantik

- Alt text deskriptif untuk semua poster film, contoh: `alt="Poster film Parasite (2019)"`.
- Daftar film menggunakan semantic HTML: `<ul>` / `<li>`, bukan `div` kosong.
- Satu `<h1>` per halaman.
- Tidak ada skip level heading.
- Toast notifications menggunakan `role="status"` dan `aria-live="polite"` agar screen reader mengumumkannya.

### 8.4 Motion & Animasi

- Semua animasi, seperti streak animation, Wrapped, dan transisi poster, harus menghormati `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```

### 8.5 Prioritas Implementasi

| Requirement | Prioritas | Fase |
|---|---|---|
| Alt text poster, semantic HTML, focus indicator | P0 | MVP |
| Kontras warna 4.5:1, touch target 44px, toast aria-live | P0 | MVP |
| Keyboard navigation lengkap, rating non-color | P1 | Fase 2 |
| prefers-reduced-motion, heading hierarchy audit | P1 | Fase 3 |
| Full screen reader testing, ARIA landmarks | P2 | Sebelum public launch |

---

## 9. Prinsip Desain & UX

### 9.1 Prinsip Utama

#### Personal over social

Tidak ada feed publik, tidak ada like count, tidak ada pressure untuk “terlihat bagus” di depan orang lain. Endroll adalah diary, bukan showcase.

#### Kepuasan visual

Setiap tampilan harus terasa curated dan indah. Poster film jadi elemen visual utama. User harus merasa bangga saat membuka profilnya sendiri.

#### Low friction, high reward

Logging harus bisa dilakukan dalam <30 detik. Reward berupa statistik, streak, dan visualisasi harus terasa worth it.

#### Data milik pengguna

Pengguna bisa export data kapan saja. Tidak ada lock-in. Endroll menghormati privasi penggunanya.

### 9.2 Tone & Brand

- Nama “endroll” terinspirasi dari end credits film — momen reflektif setelah film selesai.
- Tone: calm, personal, sedikit nostalgic. Bukan hype atau energetik.
- Warna utama: deep purple/violet untuk kemewahan sinematik dengan aksen warm amber.
- Background gelap untuk feel sinematik.
- Typography: serif untuk judul film, sans-serif untuk UI.

---

## 10. Tech Stack & Arsitektur

### 10.1 Rekomendasi Tech Stack

| Layer | Pilihan Utama | Alternatif |
|---|---|---|
| Frontend | Vite + React | Remix |
| Styling | Tailwind CSS + Framer Motion | Styled-components |
| Backend | Express.js | Hono |
| Database | PostgreSQL via Supabase | PlanetScale / Neon |
| ORM | Prisma | Drizzle ORM |
| Auth | NextAuth.js / Supabase Auth | Clerk |
| File Storage | Supabase Storage / Cloudflare R2 | AWS S3 |
| Film Data API | TMDb API | OMDb API |
| Hosting | Vercel untuk frontend | Railway / Render |
| Monitoring | Sentry + Vercel Analytics | LogRocket |

### 10.2 Skema Database Utama

> **Catatan penting v1.1:** Tabel `movies` diganti menjadi `titles` dengan tambahan kolom `type` (`film` / `series`) dan dukungan `season` / `episode` untuk series tracking Level 2 dan Level 3.

#### `users`

- `id`
- `email`
- `username`
- `avatar_url`
- `created_at`
- `preferences` (`JSONB`)

#### `titles`

- `id`
- `tmdb_id`
- `title`
- `type` (`film` / `series`)
- `poster_path`
- `release_year`
- `runtime_minutes`
- `genres` array
- `director`
- `cast` array

#### `watch_logs`

- `id`
- `user_id`
- `title_id`
- `watched_at`
- `rating` (`DECIMAL(3,1)`)
- `notes`
- `rewatch_count`
- `mood_tags` array
- `season_number` nullable
- `episode_number` nullable

#### `watchlist`

- `id`
- `user_id`
- `title_id`
- `added_at`
- `priority`

#### `collections`

- `id`
- `user_id`
- `name`
- `description`
- `cover_title_id`
- `is_private`
- `created_at`

#### `collection_items`

- `id`
- `collection_id`
- `title_id`
- `sort_order`
- `added_at`

#### `streaks`

- `id`
- `user_id`
- `current_streak_weeks`
- `longest_streak_weeks`
- `last_log_week` — ISO week string

---

## 11. Metrics & Success Criteria

### 11.1 North Star Metric

**Weekly Active Loggers (WAL)** — jumlah pengguna unik yang menambahkan minimal 1 entry tontonan per minggu. Ini mencerminkan kebiasaan aktif menggunakan Endroll sebagai jurnal, bukan sekadar sign up lalu churn.

### 11.2 Target Metrics

| Metrik | Target 3 Bulan | Target 12 Bulan |
|---|---:|---:|
| Weekly Active Loggers (WAL) | 500 WAL | 5.000 WAL |
| Total Registered Users | 2.000 users | 25.000 users |
| D30 Retention Rate | 25% | 40% |
| Avg. entries per user/bulan | 8 entries | 15 entries |
| Avg. streak length | 3 minggu | 7 minggu |
| NPS Score | 40+ | 60+ |
| Churn Rate bulanan | <15% | <8% |
| Onboarding completion rate | >60% | >75% |

### 11.3 Anti-metrics

- Jumlah followers / koneksi sosial — Endroll bukan platform sosial.
- Viral sharing — growth harus organik dari value, bukan engagement bait.
- Time on site yang tidak bermakna — kita ingin pengguna log cepat, bukan scroll lama.

---

## 12. Scope v1.0

### 12.1 Dalam Scope

- Web app responsive: mobile-first, desktop-ready
- Log film & series dengan integrasi TMDb API + opsi manual
- Rating desimal 0.0–10.0, notes, watchlist, collections
- Streak mingguan dan statistik dasar termasuk director/aktor tracking
- Akun personal dengan profil yang bisa dikustomisasi
- Authentication via email + Google OAuth
- Onboarding flow 7 langkah

### 12.2 Di Luar Scope v1.0

- Native mobile app iOS/Android — roadmap Q3–Q4
- Fitur sosial, feed, atau follower — sengaja tidak dibangun
- Rekomendasi AI — butuh data yang cukup terlebih dahulu
- Podcast, buku, atau musik tracking — fokus film & series dulu
- Monetisasi premium — belum di v1.0, fokus akuisisi pengguna dulu
- Offline-first PWA — v2+
- Episode-level tracking UI — infrastruktur siap, UI di v2+

---

## 13. Strategi Monetisasi (Roadmap)

v1.0 tidak memiliki monetisasi. Fokus sepenuhnya pada akuisisi dan retensi pengguna. Keputusan monetisasi diambil setelah mencapai PMF dan user base yang stabil.

Arah yang direncanakan, belum final:

- **Free tier:** semua fitur P0 + P1 tanpa batas, selamanya.
- **Pro tier nanti:** export data, tema custom unlimited, Wrapped yang lebih detail, episode-level tracking UI.
- **Iklan:** opsi terakhir jika model Pro tidak cukup. Jika diimplementasi, non-intrusive dan tidak tampil di dalam diary/log.
- **React Native app:** rencananya berbayar one-time atau freemium dengan fitur eksklusif mobile.

---

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kompetisi dari Letterboxd | Tinggi | Fokus diferensiasi: privacy-first, no social pressure, rating desimal, richer personal stats. |
| TMDb API rate limit / downtime | Medium | Cache data film di DB sendiri setelah first fetch. Opsi input manual sebagai fallback. |
| Low user retention | Tinggi | Onboarding yang kuat dengan log film pertama, weekly streak mechanic, Wrapped tahunan, On This Day. |
| Data privacy concern | Medium | No public data by default, fitur export, clear privacy policy. |
| Tech debt dari vibe coding | Tinggi | Buat `CLAUDE.md`, code review berkala, test per modul. |
| Empty state churn | Medium | Empty states yang warm dan encouraging di semua halaman utama. |

---

## 15. Timeline & Milestones

| Fase | Timeline | Deliverables |
|---|---|---|
| Fase 0 — Pre-build | Minggu 1–2 | Finalize PRD v1.1, wireframe halaman utama, setup DB schema dengan series support, buat `CLAUDE.md`, setup repo & CI/CD. |
| Fase 1 — MVP Core | Minggu 3–6 | Auth, search film via TMDb, log tontonan, rating desimal, notes, watchlist, profil dasar, error handling. |
| Fase 2 — Engagement | Minggu 7–10 | Collections, weekly streak, statistik dashboard, director tracking, mood tags, rewatch, series Level 2. |
| Fase 3 — Polish | Minggu 11–14 | On This Day, watchlist expiry, Wrapped tahunan, tema visual, accessibility audit, onboarding polish. |
| Fase 4 — Launch | Minggu 15–16 | Beta testing 50–100 user, feedback iteration, public launch. |
| Fase 5 — Post-launch | Bulan 5+ | Monitor metrics, implement feedback, mulai P2/P3 features berdasarkan data, evaluasi model monetisasi. |

---

## 16. Open Questions

Pertanyaan-pertanyaan ini perlu dijawab sebelum atau selama development:

- Apakah profil pengguna akan bisa di-set public? Jika ya, apa yang bisa dilihat orang lain?
- Bagaimana strategy untuk mendapatkan 500 WAL pertama — Product Hunt, komunitas film lokal, atau creator partnership?
- Apakah Endroll akan mendukung tracking untuk konten non-streaming seperti bioskop, DVD, atau festival film?
- Seberapa dalam integrasi TMDb — apakah kita juga menampilkan trailer, cast detail, atau hanya metadata dasar?
- Bagaimana UX slider rating di mobile? Tap angka langsung atau drag slider?

---

_Dokumen ini adalah living document — update seiring perkembangan produk._
