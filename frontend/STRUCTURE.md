# Struktur Frontend Endroll

Panduan susunan folder & konvensi untuk frontend (Vite + React + TypeScript).
Tujuannya satu: **mudah dinavigasi oleh solo dev, tetap siap saat backend masuk.**

Prinsip induk: ikuti [CLAUDE.md](./CLAUDE.md) untuk produk & brand. Dokumen ini
hanya soal *susunan kode*.

---

## Filosofi

1. **Satu item nav = satu feature = domain data yang jelas.** Setiap halaman di
   sidebar (Home, Diary, Explore, Watchlist, Collections, Statistics, Settings)
   punya satu folder feature. **Tidak ada folder payung** yang mencampur konsep
   (mis. hindari `dashboard` yang isinya Home+Statistics, atau `lists` yang
   isinya Watchlist+Collections).
2. **Feature-based, tapi flat.** Jangan bikin folder dalam-dalam. Folder dibuat
   hanya saat sebuah file punya "anak"; satu file tidak perlu folder sendiri.
3. **Shared UI bukan feature.** Kalau sebuah komponen di-import oleh banyak
   feature (mis. `Poster`, `TitleCard`, `GenrePill`), dia **bukan** milik satu
   feature — taruh di `components/ui/`. Aturan cepat: kalau feature A meng-import
   komponen dari feature B, komponen itu salah tempat.
4. **Satu konsep, satu nama.** Hindari lapisan pembungkus yang cuma re-export
   (mis. `pages/Diary/Diary.tsx` yang isinya `<DiaryView />`).
5. **Batas store = batas feature.** State satu domain tinggal di satu slice, dan
   slice itu "dimiliki" oleh feature yang sama. Jangan sampai watchlist ada di
   folder feature `watchlist` tapi state-nya nyangkut di slice diary.
6. **Impor pakai alias `@/`** (`@/features/diary/DiaryPage`), bukan
   `../../features/...`.

---

## Peta folder `src/`

```txt
src/
├── main.tsx                 # entry
├── App.tsx                  # router + provider global
├── index.css                # design tokens (--bg, --accent, dst) + reset global
│
├── components/              # komponen dipakai LINTAS feature
│   ├── ui/                  # primitives: Badge, EmptyState, SearchInput, Toast,
│   │                        #   Poster, TitleCard, GenrePill...
│   └── layout/              # shell aplikasi: AppLayout, Navigation, PageHeader...
│
├── features/               # satu folder per item nav (lihat tabel di bawah)
│   ├── auth/                # Login, Register, ProtectedRoute
│   ├── home/                # Home overview
│   ├── diary/               # Diary + Log
│   ├── titles/              # Explore + Title Detail (HANYA ini)
│   ├── watchlist/           # Watchlist
│   ├── collections/         # Collections
│   ├── statistics/          # Statistics / personal insights
│   └── settings/            # Settings
│
├── store/                  # Zustand: SATU store, digabung dari slice per domain
│   ├── useStore.ts
│   ├── diarySlice.ts       # watchLogs + personalRatings (rating per-judul)
│   ├── watchlistSlice.ts   # watchlist — DIPISAH dari diary
│   ├── collectionSlice.ts
│   ├── titleSlice.ts       # exploreData
│   └── userSlice.ts
│
├── contexts/               # HANYA untuk cross-cutting non-domain (mis. Toast)
├── hooks/                  # hook generik lintas feature
├── lib/                    # klien eksternal & util berat: apiClient, tmdb (nanti)
├── utils/                  # helper murni tanpa dependency (formatters, dst)
├── types/                  # tipe global lintas feature (User, Title, WatchLog...)
├── data/                   # mock data sementara (dibuang saat backend siap)
└── assets/                 # gambar statis yang di-import
```

---

## Pemetaan nav → feature → slice (target)

Referensi cepat. Setiap baris konsisten dari kiri ke kanan.

| Route / Nav | Feature folder | Halaman | Slice pemilik |
|---|---|---|---|
| `/login`, `/register` | `auth` | LoginPage, RegisterPage | `userSlice` (→ `authSlice`) |
| `/home` | `home` | HomePage | baca `diarySlice` |
| `/diary`, `/log` | `diary` | DiaryPage, LogTitlePage | `diarySlice` |
| `/explore` | `titles` | ExplorePage | `titleSlice` |
| `/title/:id` | `titles` | TitleDetailPage | baca beberapa slice |
| `/watchlist` | `watchlist` | WatchlistPage | `watchlistSlice` |
| `/collections` | `collections` | CollectionsPage | `collectionSlice` |
| `/statistics` | `statistics` | StatisticsPage | baca `diarySlice` |
| `/settings` | `settings` | SettingsPage | `userSlice` |

Komponen bersama yang dipindah dari `titles` → `components/ui`:
`Poster`, `TitleCard`, `GenrePill` (dipakai oleh diary, statistics, watchlist,
collections, detail).

---

## Anatomi satu feature

Satu feature = satu folder **flat**. Contoh target untuk `diary`:

```txt
features/diary/
├── DiaryPage.tsx           # dipetakan langsung ke route di App.tsx
├── DiaryPage.module.css
├── LogTitlePage.tsx
├── LogTitlePage.module.css
├── DiaryEntry.tsx          # komponen milik feature ini
├── SortDropdown.tsx
├── diary.store.ts          # slice Zustand feature (saat backend siap)
├── diary.api.ts            # panggilan API feature (saat backend siap)
└── diary.types.ts          # tipe khusus feature
```

Aturan:

- **`XPage.tsx`** = komponen yang dipasang di router. Tidak ada lagi lapisan
  `pages/` terpisah, dan tidak ada akhiran `View`.
- Butuh sub-komponen yang **hanya** dipakai satu file? Boleh bikin subfolder,
  tapi hanya kalau jumlahnya sudah banyak (≥3 file berkaitan). Kalau tidak,
  taruh flat di folder feature.
- Komponen yang mulai dipakai feature lain → **naikkan** ke `src/components/ui`.

---

## Keputusan state (penting)

Supaya tidak pusing "di mana datanya":

| Jenis state | Rumahnya |
|---|---|
| Diary (watchLogs) + rating per-judul | `diarySlice` |
| Watchlist | `watchlistSlice` (**dipisah** dari diary) |
| Collections | `collectionSlice` |
| Explore data (TMDb) | `titleSlice` |
| User / session / auth | `userSlice` (→ `authSlice`) — *bukan* Context |
| UI ephemeral non-domain (Toast) | **Context** di `src/contexts` |
| State lokal 1 komponen | `useState` biasa |

> **Catatan penting — pemisahan `watchSlice`:** sekarang `watchSlice` masih
> menampung watchLogs **dan** watchlist sekaligus. Ini yang bikin batas store
> tidak cocok dengan batas feature. Target: pecah jadi `diarySlice` (watchLogs +
> `personalRatings`) dan `watchlistSlice` (watchlist saja).
>
> **Catatan transisi Auth:** saat ini Auth masih di `contexts/AuthContext`.
> Rencananya dipindah jadi bagian `userSlice`/`authSlice`. Sampai itu terjadi,
> jangan tambah Context baru untuk data domain.

> **Rating per-judul (keputusan owner):** rating disimpan global per judul di
> `personalRatings: Record<titleId, number>`, **bukan** per watch-log. Jangan
> "kembalikan" ke `WatchLog.rating` (field itu sengaja deprecated).

Folder `store/`, `api/`, `types/` **per-feature** (yang sekarang kosong ber-
`.gitkeep`) adalah placeholder resmi untuk backend. Saat diisi: pakai file flat
(`diary.store.ts`), **bukan** folder berisi satu file.

---

## Konvensi penamaan

- **Komponen & file komponen**: `PascalCase` → `DiaryEntry.tsx`, `TitleCard.tsx`.
- **Halaman**: akhiri `Page` → `DiaryPage.tsx`, `SettingsPage.tsx`.
- **Hook**: `useXxx.ts` → `useDerivedState.ts`.
- **Slice store**: `xxxSlice.ts` → `diarySlice.ts`, `watchlistSlice.ts`.
- **CSS Module**: sejajar komponennya → `DiaryEntry.module.css`.
- **Util/helper**: `camelCase` → `formatters.ts`.
- **Tipe**: `PascalCase` (`Title`, `WatchLog`) — samakan dengan istilah produk di
  CLAUDE.md (`Title` bukan `Movie`, `WatchLog`, `Collection`, dst).

---

## Impor

- Gunakan alias **`@/`** untuk apa pun di `src/`:
  ```ts
  import DiaryEntry from '@/features/diary/DiaryEntry'
  import { useStore } from '@/store/useStore'
  ```
- Impor **file tetangga** (folder sama) boleh tetap relatif `./`:
  ```ts
  import SortDropdown from './SortDropdown'
  ```
- Alias diset di dua tempat yang harus sinkron:
  `tsconfig.app.json` (`paths`) dan `vite.config.ts` (`resolve.alias`).

---

## Checklist saat menambah sesuatu

**Halaman baru:**
1. Buat `features/<domain>/<Nama>Page.tsx`.
2. Daftarkan route-nya di `App.tsx` (pakai `lazy()` untuk code-splitting).
3. Tidak perlu menyentuh `pages/`.

**Komponen baru:**
- Dipakai satu feature → taruh di folder feature itu (flat).
- Dipakai lintas feature → `src/components/ui`.
- Bagian shell/layout → `src/components/layout`.

**State/data baru:**
- Domain → slice di `src/store` (atau `features/<domain>/<domain>.store.ts`).
- Panggilan API → `features/<domain>/<domain>.api.ts` + klien di `src/lib`.

---

## Rencana migrasi bertahap (dari struktur sekarang)

Urut dari dampak tinggi / risiko rendah. Dikerjakan sepotong-sepotong.

**Tahap 1 — shared UI keluar (aman, cuma pindah + update import):**
- [ ] Pindahkan `Poster`, `TitleCard`, `GenrePill` dari `features/titles/components`
      → `components/ui/`, update import (pakai `@/components/...`)

**Tahap 2 — bongkar folder payung jadi per-nav:**
- [ ] `dashboard` → pecah jadi `home/` dan `statistics/`
- [ ] `lists` → pecah jadi `watchlist/` dan `collections/`
- [ ] `user` → rename `settings/`

**Tahap 3 — samakan batas store dengan feature:**
- [ ] Pecah `watchSlice` → `diarySlice` (watchLogs + `personalRatings`) +
      `watchlistSlice` (watchlist)

**Tahap 4 — ratakan tiap feature & buang lapisan `pages/`:**
- [ ] Ratakan `XView` → `XPage`, naikkan sub-komponen (mulai `diary`)
- [ ] Hapus `src/pages/` setelah semua route menunjuk `features/*`
- [ ] Pindahkan `AuthContext` → `userSlice`/`authSlice`
- [ ] Rapikan 2 lint error lama di `AuthContext` (setState-in-effect, export)
```
