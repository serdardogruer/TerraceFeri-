# PostgreSQL

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri'nin ana veritabanı kurulum ve konfigürasyon dokümantasyonu.

---

# Versiyon

PostgreSQL 15+

---

# Kurulum

## Ubuntu Server

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Docker

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: terraceferi
      POSTGRES_USER: tmm_user
      POSTGRES_PASSWORD: strong_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

# Veritabanı Oluşturma

```sql
-- PostgreSQL shell
CREATE DATABASE terraceferi;
CREATE USER tmm_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE terraceferi TO tmm_user;
```

---

# Bağlantı Havuzu

Prisma varsayılan bağlantı havuzu kullanır.

```env
DATABASE_URL="postgresql://tmm_user:password@localhost:5432/terraceferi?schema=public&connection_limit=10"
```

---

# pgvector (v2 — RAG için)

```bash
# pgvector uzantısı
sudo apt install postgresql-15-pgvector

# Veritabanında etkinleştir
CREATE EXTENSION IF NOT EXISTS vector;
```

---

# İndeksler

```sql
-- Sık sorgulanan kolonlar için indeks
CREATE INDEX idx_faults_status ON faults(status);
CREATE INDEX idx_faults_created_at ON faults(created_at DESC);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_meters_logged_at ON meters(logged_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
```

---

# Yedekleme

## Manuel Yedek

```bash
pg_dump -U tmm_user -h localhost terraceferi > backup_$(date +%Y%m%d).sql
```

## Otomatik Yedek (Cron)

```bash
# /etc/cron.d/terraceferi-backup
0 2 * * * postgres pg_dump terraceferi > /backups/db_$(date +\%Y\%m\%d).sql
```

## Yedek Geri Yükleme

```bash
psql -U tmm_user -d terraceferi < backup_20260101.sql
```

---

# Güvenlik

```bash
# pg_hba.conf — Yalnızca lokal bağlantı
host all all 127.0.0.1/32 md5
```

- Şifreler güçlü ve özel olmalı
- Dışarıya port açılmamalı (production)
- Düzenli yedekleme zorunlu

---

# Performans

```sql
-- En yavaş sorguları bul
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

# Monitoring

- `pg_stat_activity` — Aktif bağlantılar
- `pg_stat_user_tables` — Tablo istatistikleri
- pgAdmin (görsel yönetim)
