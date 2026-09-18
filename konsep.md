# Konsep Aplikasi Manajemen Keuangan Keluarga

## MVP v1

### 1. Tujuan Aplikasi

Aplikasi digunakan oleh keluarga kecil, terutama **suami dan istri**, untuk mengelola keuangan bersama dalam satu data keluarga.

Aplikasi harus memungkinkan:

* Suami dan istri login menggunakan akun masing-masing.
* Keduanya mengakses data keuangan keluarga yang sama.
* Setiap transaksi mencatat siapa yang memasukkan data.
* Pengeluaran dapat dikategorikan.
* Pengeluaran mengurangi saldo wallet.
* Pengeluaran dapat dibandingkan dengan budget kategori.
* Pemasukan menambah saldo wallet.
* Transfer antar-wallet tidak dianggap sebagai pengeluaran.
* Tersedia dashboard keuangan.
* Tersedia laporan bulanan.

---

# 2. Teknologi

## Backend

**Laravel**

Digunakan untuk:

* Authentication
* Business logic
* Authorization
* REST API
* Database management
* Validation
* Reporting

## Frontend

**React**

Digunakan untuk:

* Dashboard
* Form transaksi
* Wallet
* Budget
* Laporan
* Family management

## Database

**MySQL**

Seluruh data utama aplikasi disimpan di MySQL.

Firebase tidak digunakan sebagai database utama.

## Authentication

Menggunakan authentication Laravel.

Untuk API, dapat menggunakan:

**Laravel Sanctum**

---

# 3. Konsep Multi-User

Aplikasi tidak menggunakan konsep:

```text
User → Data Keuangan
```

Tetapi:

```text
User → Family → Data Keuangan
```

Contoh:

```text
Budi
   │
   ├── Family
   │      ├── Budi
   │      ├── Siti
   │      ├── Wallet
   │      ├── Budget
   │      └── Transactions
   │
Siti
   │
   └── Family yang sama
```

Dengan sistem ini, suami dan istri mempunyai akun masing-masing tetapi menggunakan data keuangan keluarga yang sama.

---

# 4. Modul Utama

Aplikasi terdiri dari:

```text
1. Authentication
2. Family / Household
3. Members
4. Wallet / Account
5. Categories
6. Income
7. Expense
8. Transfer
9. Budget
10. Dashboard
11. Monthly Report
12. Activity Log
```

---

# 5. Authentication

User dapat:

* Register
* Login
* Logout
* Forgot password
* Reset password
* Mengelola profile

Setiap user mempunyai akun sendiri.

Contoh:

```text
Budi
budi@email.com

Siti
siti@email.com
```

---

# 6. Family / Household

Family adalah wadah utama seluruh data keuangan.

Contoh:

```text
Keluarga Budi & Siti
```

Satu family mempunyai beberapa member.

Contoh:

```text
Family: Keluarga Budi & Siti

├── Budi
└── Siti
```

### Role awal

Gunakan dua role sederhana:

```text
owner
member
```

Owner dapat:

* Mengelola family
* Mengundang member
* Menghapus member
* Mengelola pengaturan family

Member dapat:

* Melihat data keluarga
* Menambah transaksi
* Mengelola transaksi sesuai permission

Permission dapat dikembangkan kemudian.

---

# 7. Wallet / Account

Wallet digunakan untuk menyimpan sumber uang.

Jenis wallet:

```text
cash
digital
saving
```

Contoh:

```text
Dompet Fisik
GoPay
OVO
Tabungan Nikah
Tabungan Lainnya
Bank
```

Struktur:

```text
wallets

id
family_id
name
type
balance
created_at
updated_at
```

### Catatan penting

`balance` dapat digunakan sebagai nilai saldo saat ini/cache.

Namun histori keuangan tetap berasal dari transaksi.

Contoh:

```text
Dompet

Saldo awal       Rp500.000
Income           +Rp1.000.000
Expense          -Rp250.000
Transfer keluar  -Rp100.000
Transfer masuk   +Rp50.000
```

Saldo akhir:

```text
Rp1.200.000
```

Sistem harus memastikan perubahan saldo dan transaksi dilakukan secara konsisten menggunakan database transaction Laravel.

---

# 8. Income

Income adalah uang masuk ke wallet.

Kategori awal:

```text
Gaji
Jualan Web
Dikasih Orang
Lain-lain
```

Contoh:

```text
Gaji
Rp5.000.000
→ masuk ke Bank
```

Data disimpan sebagai transaction:

```text
type = income
wallet_to_id = Bank
amount = 5000000
```

Income akan:

```text
Menambah saldo wallet
```

---

# 9. Expense

Kategori expense awal:

```text
Bensin
Makan
Jajan
Jalan-jalan
Perawatan Motor
Langganan
Lain-lain
```

Contoh:

```text
Bensin
Rp50.000
dibayar dari Dompet
```

Sistem akan:

```text
Dompet
Rp500.000
      ↓
   - Rp50.000
      ↓
Rp450.000
```

Expense juga dihitung terhadap budget kategori.

---

# 10. Transfer

Transfer digunakan ketika uang berpindah antar-wallet.

Contoh:

```text
Dompet → GoPay
Rp200.000
```

Data:

```text
type = transfer

wallet_from_id = Dompet
wallet_to_id   = GoPay
amount         = 200000
```

Transfer:

* Mengurangi wallet asal.
* Menambah wallet tujuan.
* Tidak dihitung sebagai expense.
* Tidak mengurangi budget.

Ini penting agar total kekayaan keluarga tidak salah dihitung.

---

# 11. Transaction

Semua aktivitas keuangan menggunakan satu konsep transaction.

Struktur:

```text
transactions

id
family_id
created_by
paid_by
type
category_id
amount
wallet_from_id
wallet_to_id
transaction_date
note
created_at
updated_at
```

### Type

```text
income
expense
transfer
```

### `created_by`

Menunjukkan siapa yang memasukkan transaksi.

Contoh:

```text
created_by = Siti
```

### `paid_by`

Menunjukkan siapa yang melakukan pembayaran.

Contoh:

```text
created_by = Siti
paid_by    = Budi
```

Hal ini memungkinkan aplikasi membedakan:

> Siapa yang mencatat?

dengan:

> Siapa yang membayar?

---

# 12. Categories

Kategori dibuat menjadi tabel tersendiri agar dapat dikembangkan.

Struktur:

```text
categories

id
family_id
name
type
is_default
created_at
updated_at
```

Contoh income:

```text
Gaji
Jualan Web
Dikasih Orang
```

Contoh expense:

```text
Bensin
Makan
Jajan
Jalan-jalan
Perawatan Motor
Langganan
Lain-lain
```

Di masa depan user dapat membuat kategori sendiri.

---

# 13. Budget

Budget dibuat berdasarkan kategori dan bulan.

Struktur:

```text
budgets

id
family_id
category_id
monthly_limit
month
year
created_at
updated_at
```

Contoh:

```text
Makan
September 2026
Limit: Rp2.000.000
```

Pengeluaran:

```text
Rp500.000
Rp300.000
Rp400.000
```

Total:

```text
Rp1.200.000
```

Sisa:

```text
Rp800.000
```

### Catatan

`current_spent` tidak perlu menjadi sumber data utama.

Nilai pengeluaran dihitung dari transaksi expense pada kategori dan bulan tersebut.

Dengan demikian:

```text
Budget
      ↓
SUM(Transaction Expense)
      ↓
Current Spent
      ↓
Monthly Limit - Current Spent
      ↓
Remaining Budget
```

---

# 14. Dashboard

Dashboard menjadi halaman utama setelah login.

Menampilkan:

### Total Uang

Gabungan saldo seluruh wallet keluarga.

```text
Rp12.500.000
```

### Pengeluaran Bulan Ini

```text
Rp4.250.000
```

### Total Income Bulan Ini

```text
Rp10.000.000
```

### Sisa Budget

```text
Rp2.750.000
```

### Wallet

```text
Dompet          Rp500.000
GoPay           Rp750.000
Bank            Rp3.000.000
Tabungan Nikah  Rp8.000.000
```

---

# 15. Grafik Dashboard

Minimal terdapat:

### Expense by Category

Menampilkan distribusi pengeluaran.

```text
Makan             35%
Bensin            15%
Jajan              8%
Jalan-jalan       10%
Langganan          7%
Lain-lain         25%
```

### Income vs Expense

Menampilkan perbandingan:

```text
Income
Expense
```

berdasarkan bulan.

### Daily Expense

Menampilkan pengeluaran berdasarkan tanggal.

---

# 16. Monthly Report

Laporan bulanan dapat memilih:

```text
Januari 2026
Februari 2026
...
September 2026
```

Isi laporan:

### Summary

```text
Total Income
Total Expense
Net Cash Flow
```

### Income Breakdown

```text
Gaji
Jualan Web
Dikasih Orang
Lain-lain
```

### Expense Breakdown

```text
Makan
Bensin
Jajan
Jalan-jalan
Perawatan Motor
Langganan
Lain-lain
```

### Wallet Summary

```text
Dompet
GoPay
Bank
Tabungan Nikah
```

### Member Activity

Menampilkan aktivitas berdasarkan anggota keluarga.

Contoh:

```text
Budi
Rp2.400.000

Siti
Rp1.850.000
```

Data ini berdasarkan transaksi yang dicatat/dibayar oleh masing-masing member sesuai definisi laporan.

---

# 17. Activity Log

Setiap aktivitas penting dapat dicatat.

Contoh:

```text
18 Sep 2026

Siti menambahkan expense
Makan - Rp50.000

Budi menambahkan income
Gaji - Rp5.000.000

Siti mengubah budget
Makan
Rp1.500.000 → Rp2.000.000
```

Tujuannya supaya keluarga dapat mengetahui perubahan data.

---

# 18. Relasi Database

Gambaran sederhananya:

```text
users
  │
  │
  ▼
family_members
  │
  │
  ▼
families
  │
  ├──────────────┐
  │              │
  ▼              ▼
wallets       categories
  │              │
  │              │
  └──────┬───────┘
         │
         ▼
    transactions
         │
         ▼
       budgets
```

---

# 19. Prinsip Perhitungan Keuangan

## Total Uang

```text
SUM(all wallet balances)
```

## Total Income Bulan Ini

```text
SUM(income transactions)
```

## Total Expense Bulan Ini

```text
SUM(expense transactions)
```

## Net Cash Flow

```text
Total Income - Total Expense
```

## Budget Spent

```text
SUM(expense berdasarkan category + month)
```

## Sisa Budget

```text
Monthly Limit - Budget Spent
```

Transfer tidak masuk ke perhitungan income maupun expense.

---

# 20. Keamanan Data

Karena ini aplikasi keuangan, setiap query harus selalu memperhatikan `family_id`.

Contoh konsep:

```text
User
  ↓
Family Member
  ↓
Family ID
  ↓
Data Family
```

User dari Family A tidak boleh mengakses:

```text
Wallet Family B
Transaction Family B
Budget Family B
```

Authorization harus dilakukan di backend Laravel, bukan hanya menyembunyikan data di React.

---

# 21. Prinsip Database

MySQL menjadi **single source of truth**.

React:

```text
UI
```

Laravel:

```text
Business Logic
Authorization
Validation
API
```

MySQL:

```text
Persistent Data
```

Flow:

```text
React
  ↓
Laravel API
  ↓
Validation
  ↓
Authorization
  ↓
Business Logic
  ↓
MySQL
```

Tidak ada business-critical financial data yang hanya disimpan di browser/local storage.

---

# 22. Scope MVP v1

Fitur yang wajib selesai:

```text
[✓] Register / Login
[✓] Family
[✓] Member
[✓] Wallet
[✓] Category
[✓] Income
[✓] Expense
[✓] Transfer
[✓] Budget
[✓] Dashboard
[✓] Monthly Report
[✓] Activity Log
```

Fitur yang belum perlu untuk MVP:

```text
[ ] Investasi
[ ] Hutang / Piutang
[ ] Cicilan kompleks
[ ] Multi-family
[ ] Export Excel
[ ] Export PDF
[ ] Notifikasi
[ ] Mobile app native
[ ] AI financial assistant
```

Fitur-fitur tersebut bisa masuk versi berikutnya setelah core finance stabil.

---

# 23. Prinsip Utama Aplikasi

Aplikasi harus selalu bisa menjawab pertanyaan berikut:

### "Uang kita sekarang ada berapa?"

→ Total Wallet

### "Bulan ini kita mengeluarkan berapa?"

→ Monthly Expense

### "Uangnya habis untuk apa?"

→ Expense by Category

### "Budget kita masih berapa?"

→ Budget Remaining

### "Uang masuk dari mana?"

→ Income by Category

### "Siapa yang mencatat transaksi?"

→ Created By

### "Siapa yang membayar?"

→ Paid By

### "Uang berada di mana?"

→ Wallet

### "Bulan ini kondisi keuangan kita bagaimana?"

→ Monthly Report

---

# 24. Arsitektur Final

```text
                    ┌─────────────┐
                    │    React    │
                    │  Frontend   │
                    └──────┬──────┘
                           │
                         HTTP
                           │
                    ┌──────▼──────┐
                    │   Laravel   │
                    │     API     │
                    ├─────────────┤
                    │ Auth        │
                    │ Validation  │
                    │ Permission  │
                    │ Business    │
                    │ Logic       │
                    └──────┬──────┘
                           │
                         Eloquent
                           │
                    ┌──────▼──────┐
                    │    MySQL    │
                    ├─────────────┤
                    │ Users       │
                    │ Families    │
                    │ Members     │
                    │ Wallets     │
                    │ Categories  │
                    │ Transactions│
                    │ Budgets     │
                    │ ActivityLog │
                    └─────────────┘
```

**Kesimpulan konsep:**

> **Satu keluarga → banyak user → satu data keuangan bersama → semua transaksi tercatat → wallet dan budget terkontrol → dashboard dan laporan bulanan.**

Ini yang kita jadikan **baseline sebelum mulai build**. Kalau fondasi ini sudah disepakati, tahap berikutnya sebaiknya bukan langsung bikin UI, tetapi membuat **ERD/database schema MySQL yang benar-benar final**, kemudian baru kita turunkan menjadi Laravel migrations + Models + Relationships.
