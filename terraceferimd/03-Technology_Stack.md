# Technology Stack

Version: 1.0

---

# Amaç

Bu doküman, TerraceFeri Rezidans Yönetim Sistemi'nde kullanılacak tüm teknolojileri tanımlar.

Bu dokümanda belirtilmeyen bir teknoloji, proje yöneticisinin onayı olmadan projeye eklenemez.

---

# Frontend

## Framework

Next.js (App Router)

Neden?

- React tabanlıdır.
- SEO desteği sunar.
- Performansı yüksektir.
- Server Components desteği vardır.
- Büyük projeler için uygundur.

---

## Language

TypeScript

Kurallar

- `any` kullanımı yasaktır.
- strict mode aktif olacaktır.
- Her fonksiyon tip belirtmelidir.

---

## Styling

Tailwind CSS

Kurallar

- CSS dosyaları minimum seviyede kullanılacaktır.
- Utility-first yaklaşımı uygulanacaktır.
- Ortak tasarımlar component haline getirilecektir.

---

## UI Library

Shadcn/ui

Kurallar

Tüm ekranlarda aşağıdaki bileşenler kullanılacaktır.

- Button
- Card
- Input
- Select
- Dialog
- Alert Dialog
- Dropdown
- Popover
- Tabs
- Accordion
- Sheet
- Table
- Badge
- Avatar
- Calendar
- Toast
- Tooltip
- Scroll Area
- Skeleton
- Command
- Context Menu
- Checkbox
- Radio Group
- Switch
- Pagination

Harici UI Framework kullanılamaz.

---

## Icon Library

Lucide React

Kurallar

Tüm ikonlar Lucide üzerinden kullanılacaktır.

---

## Form Yönetimi

React Hook Form

Validation

Zod

---

## Theme

- Koyu (Dark Mode)
- Aydınlık (Light Mode)
- Sistem (System Preference)

Tüm Web panelleri ve Android APK mobil uygulamasında dinamik tema seçici desteklenmelidir.

---

## Internationalization (i18n)

- Türkçe (TR)
- İngilizce (EN)

Kütüphane: `next-intl` (veya `react-i18next` mobil için)

Kurallar:
- Tüm statik ve dinamik arayüz metinleri dil dosyalarına (locales) çıkarılmalıdır.
- Veritabanı modellerinde dinamik veriler çoklu dil şemasına (JSONB veya translation tabloları) uygun tasarlanmalıdır.

---

# Backend

## Framework

Next.js API Routes

Büyük ölçekli servislerde

NestJS

kullanılabilir.

---

# ORM

Prisma

Kurallar

- Raw SQL minimum kullanılacaktır.
- Migration zorunludur.
- Schema güncel tutulacaktır.

---

# Database

PostgreSQL

Kurallar

- Foreign Key kullanılacaktır.
- Cascade işlemleri dikkatli uygulanacaktır.
- UUID kullanılacaktır.
- Soft Delete tercih edilecektir.

---

# Authentication

- JWT
- Refresh Token
- Role Based Access Control (RBAC)

---

# Authorization

Roller

- Yönetim
- Daire Sakini
- Teknik
- Temizlik
- Güvenlik

İleride yeni roller eklenebilir.

---

# File Storage

Yerel Depolama

İleride

- S3
- MinIO

desteklenecektir.

---

# Real Time

Socket.IO

Kullanım Alanları

- Bildirimler
- Arıza Güncelleme
- Görev Güncelleme
- Sayaçlar
- Dashboard
- Online Kullanıcılar

---

# Mobile

Android APK

Tek kod tabanı kullanılacaktır.

Responsive tasarım zorunludur.

---

# Charts

Recharts

---

# Date

date-fns

---

# HTTP Client

Fetch API

Gerekirse Axios

---

# State Management

- React Context
- Server State: TanStack Query

---

# Validation

Zod

---

# Logging

- Server Log
- Error Log
- Audit Log

---

# Testing

- Unit Test
- Integration Test
- E2E Test

---

# Version Control

- Git
- GitHub

---

# Deployment

- Docker
- Ubuntu Server
- Nginx
- PM2
- SSL

---

# Coding Standard

- TypeScript Strict
- ESLint
- Prettier

---

# Yasak Teknolojiler

- Bootstrap
- jQuery
- Material UI
- Ant Design
- Semantic UI
- Bulma

---

# Sonuç

Bu teknoloji yığını projenin standart altyapısıdır.

Tüm modüller bu teknoloji standardına uymak zorundadır.
