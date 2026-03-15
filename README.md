# Candle Bot

Analisis sederhana chart candlestick 1 menit. Dibangun dengan Vite, React, TypeScript, Tailwind CSS, dan komponen shadcn-ui.

## Persyaratan

- Node.js 18+ (disarankan Node 20 LTS)
- npm 9+

## Cara Menjalankan (Local)

1. Clone repo

```sh
git clone <URL_REPO_INI>
cd candle-whisperer-08
```

2. Install dependencies

```sh
npm install
```

Jika sebelumnya pernah `npm install` dan masih error, lakukan clean install:

Windows PowerShell:
```ps1
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

macOS/Linux:
```sh
rm -rf node_modules package-lock.json
npm install
```

3. Setup environment (wajib jika memakai Supabase)

Pastikan file `.env` berisi nilai berikut:

```sh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Jalankan dev server

```sh
npm run dev
```

Akses aplikasi di `http://localhost:8080`.

## Build & Preview

```sh
npm run build
npm run preview
```

## Troubleshooting

- Jika `vite` tidak ditemukan, pastikan sudah menjalankan `npm install`.
- Jika masih error dependency, gunakan Node.js LTS dan lakukan clean install seperti langkah di atas.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
