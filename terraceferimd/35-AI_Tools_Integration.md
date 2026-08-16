# 35 - AI Tools Integration

Version: 1.0  
Status: Approved

---

# Amaç

Bu doküman AI'nin kullanabileceği araçları (Tools) ve güvenli entegrasyon mimarisini tanımlar.

AI hiçbir sisteme doğrudan erişmez.

Tüm işlemler Tool Layer üzerinden gerçekleştirilir.

---

# Genel Mimari

```
User
  ↓
AI Gateway
  ↓
Planner
  ↓
Tool Manager
  ↓
-------------------------------
Database Tool   |  API Tool
RAG Tool        |  File Tool
IoT Tool        |  Email Tool
Notification    |  Reporting Tool
Calendar Tool   |  Search Tool
```

---

# Tool Manager

Görevleri

| Görev | Açıklama |
|---|---|
| Tool Seçimi | En uygun aracı belirler |
| Yetki Kontrolü | Kullanıcı yetkisini doğrular |
| Parametre Doğrulama | Girdileri kontrol eder |
| Timeout Yönetimi | Süre aşımını yönetir |
| Hata Yönetimi | Hataları yakalar ve işler |
| Sonuç Normalizasyonu | Çıktıları standartlaştırır |

---

# Tool Türleri

## Database Tool

İşlevler

- Veri sorgulama
- Kayıt arama
- İstatistik üretme

> Yazma işlemleri için ek yetki gerekir.

---

## API Tool

İşlevler

- REST API çağrısı
- GraphQL sorgusu
- Webhook tetikleme

---

## RAG Tool

İşlevler

- Doküman arama
- Benzer içerik bulma
- Kaynak doğrulama

---

## File Tool

Desteklenen

- PDF
- Word
- Excel
- CSV
- Görseller
- ZIP

İşlevler

- Okuma
- Özetleme
- İçerik çıkarma
- Metadata analizi

---

## Reporting Tool

İşlevler

- PDF üretimi
- Excel üretimi
- KPI raporları
- Yönetici özetleri

---

## Calendar Tool

İşlevler

- Bakım planlama
- Görev oluşturma
- Hatırlatma ekleme

---

## Notification Tool

Kanallar

- E-posta
- Push
- SMS
- Web Bildirimi

Her gönderim loglanır.

---

## IoT Tool

Desteklenen

- MQTT
- Modbus
- OPC-UA
- BACnet

İşlevler

- Sensör okuma
- Alarm sorgulama
- Cihaz durumu

---

## Search Tool

Arama alanları

- Dokümanlar
- Ekipmanlar
- Arızalar
- Bakımlar
- Kullanıcılar

---

# Tool Çağrı Akışı

```
User Request
  ↓
Planner
  ↓
Tool Selection
  ↓
Permission Check
  ↓
Execute Tool
  ↓
Validate Result
  ↓
LLM
  ↓
Response
```

---

# Yetkilendirme

Her Tool

- Rol
- Tenant
- Modül
- İşlem Türü

kontrolü yapacaktır.

---

# Timeout Politikası

Varsayılan

**30 saniye**

Aşıldığında

- İşlem durdurulur.
- Hata loglanır.
- Kullanıcıya uygun mesaj döndürülür.

---

# Hata Yönetimi

Tool başarısız olursa

- Yeniden deneme (Retry)
- Alternatif Tool
- Kullanıcı bilgilendirmesi

uygulanabilir.

---

# Güvenlik

Tool katmanında zorunlu kontroller:

| Kontrol | Açıklama |
|---|---|
| Input Validation | Giriş doğrulama |
| Output Validation | Çıkış doğrulama |
| Rate Limit | İstek sınırlandırma |
| Audit Log | İşlem kayıtları |
| Secret Masking | Gizli veri maskeleme |
| Yetki Kontrolü | RBAC doğrulama |

---

# Tool Logları

Her çağrıda kayıt tutulacak alanlar:

| Alan | Açıklama |
|---|---|
| Tool Adı | Kullanılan araç |
| Kullanıcı | İsteği yapan kullanıcı |
| Tenant | Tesis kimliği |
| Parametre Özeti | İstek parametreleri |
| Süre | Yanıt süresi (ms) |
| Durum | Başarılı / Hatalı |
| Hata Kodu | Hata varsa kodu |

---

# Performans

| Metrik | Hedef |
|---|---|
| Tool Seçimi | < 100 ms |
| Ortalama Tool Çağrısı | < 1 sn |
| Başarı Oranı | > %99 |

---

# Genişletilebilirlik

Yeni Tool eklemek için

1. Tool Interface uygulanmalıdır.
2. Yetki politikaları tanımlanmalıdır.
3. Testleri yazılmalıdır.
4. Dokümantasyonu hazırlanmalıdır.

---

# Gelecek Yol Haritası

## V2

- Workflow Tool
- OCR Tool
- Speech Tool
- Vision Tool
- PLC Programming Tool

## V3

- Multi-Tool Orchestration
- Self-Healing Tools
- AI Tool Marketplace
- Tool Chaining
- Autonomous Tool Selection
