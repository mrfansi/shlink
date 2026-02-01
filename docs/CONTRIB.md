# Panduan Kontribusi

Selamat datang di proyek Shlink! Dokumen ini memberikan informasi tentang cara menyiapkan lingkungan pengembangan dan alur kerja untuk berkontribusi.

## Alur Kerja Pengembangan

1.  **Persiapan**: Pastikan Anda memiliki Node.js 20+ dan `wrangler` CLI terinstal global (`npm i -g wrangler`).
2.  **Kloning**: Kloning repositori ini.
3.  **Instalasi**: Jalankan `npm install`.
4.  **Database**: Jalankan migrasi lokal dengan `npm run db:migrate:local`.
5.  **Pengembangan**: Jalankan `npm run dev` untuk memulai server pengembangan.
6.  **Fitur**: Buat cabang fitur baru, lakukan perubahan, dan pastikan kode melewati linter.
7.  **PR**: Kirim Pull Request dengan deskripsi yang jelas tentang perubahan Anda.

## Skrip yang Tersedia

Berikut adalah daftar skrip yang dapat digunakan:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js. |
| `npm run build` | Membangun aplikasi untuk produksi. |
| `npm run start` | Menjalankan server produksi (setelah build). |
| `npm run lint` | Memeriksa kualitas kode menggunakan ESLint. |
| `npm run deploy` | Membangun dan mendeploy aplikasi ke Cloudflare Workers. |
| `npm run upload` | Mengunggah aset build ke Cloudflare. |
| `npm run preview` | Melihat pratinjau deployment di Cloudflare. |
| `npm run cf-typegen` | Menghasilkan tipe TypeScript untuk environment Cloudflare. |
| `npm run db:generate` | Membuat file migrasi database baru menggunakan Drizzle Kit. |
| `npm run db:migrate:local` | Menerapkan migrasi database ke instansi D1 lokal. |
| `npm run db:migrate:remote`| Menerapkan migrasi database ke instansi D1 remote (produksi). |
| `npm run db:studio` | Membuka Drizzle Studio untuk manajemen data database. |

## Pengaturan Lingkungan

Salin file `.env.example` ke `.env` (atau buat file `.env`) dan sesuaikan variabel berikut:

| Variabel | Deskripsi | Format |
| :--- | :--- | :--- |
| `BETTER_AUTH_SECRET` | Kunci rahasia untuk enkripsi sesi autentikasi. | String acak panjang |
| `BETTER_AUTH_URL` | URL dasar aplikasi untuk backend autentikasi. | `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | URL publik aplikasi untuk frontend autentikasi. | `http://localhost:3000` |

## Binding Cloudflare

Proyek ini menggunakan beberapa binding Cloudflare Workers:

| Binding | Tipe | Nama | Deskripsi |
| :--- | :--- | :--- | :--- |
| `shlink_db` | D1 Database | `shlink-db` | Database utama untuk menyimpan data link dan user |
| `shlink_assets` | R2 Bucket | `shlink-assets` | Penyimpanan aset seperti QR code dan logo |
| `shlink_kv` | KV Namespace | - | Cache untuk link dan data sering diakses |
| `shlink_queue` | Queue | `shlink-queue` | Antrian untuk operasi asinkron |
| `ASSETS` | Static Assets | - | Aset statis aplikasi |
| `IMAGES` | Images | - | Optimisasi gambar Cloudflare |

## Prosedur Pengujian

Saat ini, proyek ini belum memiliki suite pengujian otomatis yang terintegrasi (unit/integration).
- **Manual**: Uji fitur baru secara manual di lingkungan lokal sebelum mendeploy.
- **Linting**: Pastikan `npm run lint` tidak menghasilkan kesalahan sebelum melakukan commit.
