# Runbook Operasional

Dokumen ini berisi prosedur operasional untuk mengelola aplikasi Shlink di produksi.

## Prosedur Deployment

Aplikasi ini dideploy sebagai Cloudflare Worker menggunakan OpenNext.

1.  **Build & Deploy**:
    Gunakan perintah berikut untuk membangun dan mendeploy ke Cloudflare:
    ```bash
    npm run deploy
    ```
    Skrip ini akan menjalankan `opennextjs-cloudflare build` dan `opennextjs-cloudflare deploy`.

2.  **Migrasi Database**:
    Setelah kode dideploy, jika ada perubahan skema database, jalankan migrasi remote:
    ```bash
    npm run db:migrate:remote
    ```

## Pemantauan dan Peringatan

- **Cloudflare Observability**: Fitur observability telah diaktifkan dalam `wrangler.jsonc`. Log dan metrik dapat diakses melalui Dashboard Cloudflare Workers.
- **Log**: Gunakan `wrangler tail shlink` untuk melihat log secara real-time dari Worker yang sedang berjalan.

## Masalah Umum dan Perbaikan

- **Kesalahan Database D1**: Jika aplikasi gagal terhubung ke database, pastikan `database_id` di `wrangler.jsonc` sudah benar dan migrasi telah diterapkan.
- **Error Autentikasi**: Periksa apakah `BETTER_AUTH_URL` di environment Cloudflare cocok dengan domain deployment.
- **Batas KV/Cache**: Jika link tidak diperbarui, coba hapus entri di KV namespace `shlink_kv`.

## Cron Trigger

Aplikasi memiliki cron trigger yang berjalan setiap hari pada pukul 00:00 UTC:
- **Jadwal**: `0 0 * * *` (setiap hari jam 00:00)
- **Fungsi**: Membersihkan data analytics yang sudah expired, atau tugas pemeliharaan lainnya

Untuk memonitor eksekusi cron:
```bash
wrangler tail shlink --format json | jq 'select(.event.scheduledTime)'
```

## Binding Reference

| Binding | Tipe | Penggunaan |
| :--- | :--- | :--- |
| `shlink_db` | D1 | Database utama (link, user, analytics) |
| `shlink_assets` | R2 | Storage untuk QR code, logo |
| `shlink_kv` | KV | Cache link untuk redirect cepat |
| `shlink_queue` | Queue | Async analytics processing |

## Prosedur Rollback

Jika deployment baru menyebabkan masalah kritis:

1.  **Rollback Deployment**:
    Gunakan dashboard Cloudflare untuk kembali ke versi Worker sebelumnya.
    Atau deploy ulang commit terakhir yang stabil:
    ```bash
    git checkout <commit_hash_stabil>
    npm run deploy
    ```

2.  **Rollback Database**:
    Hati-hati dengan rollback database. D1 tidak mendukung rollback migrasi secara otomatis. Perlu dilakukan perubahan skema manual atau migrasi balik jika memungkinkan.

## Perintah Berguna

```bash
# Lihat log real-time
wrangler tail shlink

# Lihat log dengan format JSON
wrangler tail shlink --format json

# Akses D1 database
wrangler d1 execute shlink-db --command "SELECT * FROM links LIMIT 10"

# List file di R2
wrangler r2 object list shlink-assets

# Lihat isi KV
wrangler kv key list --namespace-id 4e1b5364aa8c40bea404a55cadd87619
```
