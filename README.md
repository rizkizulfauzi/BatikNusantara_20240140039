# Ragam Batik

Ragam Batik adalah final project berbentuk layanan data batik yang dapat digunakan aplikasi lain melalui API key. Project ini memakai pola yang dekat dengan materi DAY14: **Express.js + Sequelize + PostgreSQL + JWT**, kemudian ditambah API key karena fitur tersebut diwajibkan pada final project.

## Tech Stack

- Node.js / Express.js
- PostgreSQL
- Sequelize ORM
- JWT (`jsonwebtoken`)
- API key + SHA-256 hashing
- bcryptjs
- Vercel

## Database

Nama database lokal:

```text
ragam_batik
```

Project sengaja dibuat sederhana dengan **3 tabel**:

1. `users` - menyimpan akun yang register/login.
2. `api_keys` - menyimpan API key milik user dan counter penggunaan.
3. `batiks` - menyimpan 65 data batik.

Relasi utama:

```text
users 1 -------- N api_keys

batiks = dataset utama yang diakses menggunakan API key
```

Tidak ada tabel `api_usage`. Jumlah request harian dan total request disimpan langsung di tabel `api_keys` agar struktur database lebih sederhana dan mudah dijelaskan.

## Dataset

Seeder menyediakan **65 data batik**. Tabel `batiks` memiliki atribut:

- kode
- slug
- nama
- daerah
- kota_asal
- provinsi
- pulau
- kategori_motif
- motif_utama
- warna_dominan
- warna_sekunder
- gaya_batik
- filosofi
- makna
- teknik_pembuatan
- bahan_kain
- tingkat_kerumitan
- estimasi_hari_pembuatan
- penggunaan_tradisional
- is_warisan_tradisional
- deskripsi

> Dataset disiapkan untuk kebutuhan akademik. Untuk penggunaan ilmiah/kebudayaan resmi, verifikasi kembali informasi budaya dengan sumber otoritatif.

## Setup Lokal PostgreSQL

### 1. Buat database di pgAdmin

```text
ragam_batik
```

### 2. Install dependency

```bash
npm install
```

### 3. Buat `.env`

Copy `.env.example` menjadi `.env`.

```env
DB_USER=postgres
DB_PASS=PASSWORD_POSTGRES_KAMU
DB_DATABASE=ragam_batik
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

JWT_SECRET=SECRET_RANDOM_KAMU
JWT_EXPIRES_IN=1d
NODE_ENV=development
PORT=3000
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Buat tabel dan seed 65 data

```bash
npm run db:init
```

Hasil yang diharapkan:

```text
Database connected successfully
Database synchronized
Seed selesai. Total data batik: 65
Tabel tersedia: users, api_keys, batiks
```

### 5. Jalankan project

```bash
npm run dev
```

Buka:

- `http://localhost:3000`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/docs`
- `http://localhost:3000/health`

## Flow Sistem

```text
Register / Login
      |
      v
     JWT
      |
      v
Buat API Key
      |
      v
API Key tersimpan di PostgreSQL
      |
      v
Client kirim x-api-key
      |
      v
Middleware validasi key
      |
      v
Data batik dikirim sebagai JSON
```

## Endpoint

### Authentication

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/register` | - | Register user |
| POST | `/api/login` | - | Login dan mendapatkan JWT |
| GET | `/api/me` | JWT | Profile user |

### API Key

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/keys` | JWT | Generate API key |
| GET | `/api/keys` | JWT | Melihat API key milik user |
| DELETE | `/api/keys/:id` | JWT | Menonaktifkan API key |

### Batik Data — CRUD Lengkap

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/batik` | API Key | Melihat daftar batik |
| GET | `/api/batik/:id` | API Key | Melihat detail batik berdasarkan ID |
| GET | `/api/batik/stats` | API Key | Statistik dataset |
| POST | `/api/batik` | JWT | Menambah data batik |
| PUT | `/api/batik/:id` | JWT | Mengubah data batik |
| DELETE | `/api/batik/:id` | JWT | Menghapus data batik |

Untuk endpoint GET dataset, client mengirim API key:

```http
x-api-key: rb_live_xxxxxxxxx
```

Untuk POST, PUT, dan DELETE, user yang sudah login mengirim JWT:

```http
Authorization: Bearer JWT_TOKEN
```

Pemisahan ini sengaja dibuat supaya konsep final project jelas: **API key dipakai client untuk membaca layanan data**, sedangkan **JWT dipakai user yang sudah login untuk mengelola data**.

## Contoh CRUD Batik

### Tambah data

```http
POST /api/batik
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

```json
{
  "kode": "RBTEST001",
  "nama": "Batik Uji Coba",
  "daerah": "Yogyakarta",
  "kota_asal": "Kota Yogyakarta",
  "provinsi": "DI Yogyakarta",
  "pulau": "Jawa",
  "kategori_motif": "Geometris",
  "motif_utama": "Bunga dan Garis",
  "warna_dominan": "biru",
  "warna_sekunder": "putih",
  "gaya_batik": "Kontemporer",
  "filosofi": "Keseimbangan dan ketekunan",
  "makna": "Motif uji untuk demonstrasi CRUD.",
  "teknik_pembuatan": "Tulis",
  "bahan_kain": "katun",
  "tingkat_kerumitan": "sedang",
  "estimasi_hari_pembuatan": 5,
  "penggunaan_tradisional": "busana",
  "is_warisan_tradisional": false,
  "deskripsi": "Data ini digunakan untuk pengujian endpoint POST, PUT, dan DELETE."
}
```

`slug` tidak wajib dikirim. Server akan membuat slug otomatis dari `nama`.

### Ubah data

```http
PUT /api/batik/66
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

```json
{
  "nama": "Batik Uji Coba Update",
  "warna_dominan": "merah",
  "tingkat_kerumitan": "rumit"
}
```

### Hapus data

```http
DELETE /api/batik/66
Authorization: Bearer JWT_TOKEN
```

Untuk demo, sebaiknya **POST satu data baru**, lalu gunakan ID dari response POST untuk PUT dan DELETE. Dengan begitu 65 data seed asli tidak perlu dihapus.

## Query Dinamis

```http
GET /api/batik?provinsi=Jawa%20Tengah&page=1&limit=10
```

```http
GET /api/batik?search=parang&sort=nama&order=asc
```

```http
GET /api/batik?teknik_pembuatan=Tulis&tingkat_kerumitan=rumit
```

Parameter tersedia: `search`, `provinsi`, `daerah`, `pulau`, `kategori_motif`, `teknik_pembuatan`, `warna_dominan`, `tingkat_kerumitan`, `tradisional`, `page`, `limit`, `sort`, dan `order`.

## JWT vs API Key

**JWT** didapat setelah register/login. JWT membuktikan identitas user dan digunakan untuk mengelola API key.

**API Key** dibuat oleh user yang sudah login. API key digunakan oleh aplikasi client untuk mengambil dataset batik.

Jadi keduanya tidak sama:

```text
Login -> JWT -> Generate API Key -> API Key -> Akses data batik
```

## Rate Limit Sederhana

Free plan memiliki limit 1.000 request/hari per key. Karena project hanya memakai 3 tabel, counter disimpan langsung pada `api_keys`:

- `daily_limit`
- `request_count`
- `total_requests`
- `last_request_date`
- `last_used_at`

Saat tanggal berubah, `request_count` dianggap kembali 0.

## Deploy Vercel

Mengikuti pola DAY14: `index.js` menjadi entry Express untuk lokal sekaligus Vercel, sehingga tidak memakai `vercel.json` atau folder `api/` tambahan.

PostgreSQL `localhost` hanya untuk development. Saat deployment, gunakan PostgreSQL online dan isi Environment Variables Vercel:

```text
POSTGRES_URL=connection_string_postgresql_online
JWT_SECRET=secret_production
JWT_EXPIRES_IN=1d
NODE_ENV=production
```

## Yang Perlu Dipahami Saat Presentasi

1. `routes/api.js` menentukan endpoint.
2. Controller berisi logika request dan response.
3. `authMiddleware.js` memeriksa JWT.
4. `apiKeyMiddleware.js` memeriksa API key.
5. Model Sequelize mewakili tabel PostgreSQL.
6. `users` berelasi one-to-many dengan `api_keys`.
7. `batiks` adalah dataset 65 data yang diberikan kepada client.
8. CRUD batik lengkap: GET memakai API key, sedangkan POST/PUT/DELETE memakai JWT.
9. JWT dan API key punya fungsi berbeda.
