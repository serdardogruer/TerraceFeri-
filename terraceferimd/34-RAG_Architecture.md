# 34 - RAG Architecture

Version: 1.0  
Status: Approved

---

# Amaç

Bu doküman TMM Core sisteminde kullanılacak Retrieval Augmented Generation (RAG) mimarisini tanımlar.

RAG sistemi;

- Kurumsal bilgiye erişim
- Halüsinasyonu azaltma
- Güncel veri kullanımı
- Kaynak gösterilebilir cevaplar
- AI doğruluğunu artırma

amacıyla tasarlanmıştır.

---

# Genel Mimari

```
User Question
      │
      ▼
Context Builder
      │
      ▼
Embedding Engine
      │
      ▼
Vector Search
      │
      ▼
Relevant Documents
      │
      ▼
Prompt Builder
      │
      ▼
LLM
      │
      ▼
Validated Response
```

---

# Veri Kaynakları

Desteklenen kaynaklar

- PDF
- DOCX
- XLSX
- CSV
- Markdown
- HTML
- JSON
- API
- Database
- Wiki
- SOP Dokümanları
- Bakım Talimatları
- Teknik Çizimler
- Kullanım Kılavuzları

---

# Doküman İşleme

```
Upload
  ↓
Validation
  ↓
Text Extraction
  ↓
Cleaning
  ↓
Chunking
  ↓
Embedding
  ↓
Vector Database
```

---

# Chunking

Varsayılan

- 500 Token

Overlap

- 100 Token

Ayarlanabilir olacaktır.

---

# Embedding

Desteklenen modeller

- BAAI BGE
- Nomic Embed
- OpenAI Embedding
- E5 Large
- Sentence Transformers

Embedding modeli değiştirilebilir.

---

# Vector Database

Desteklenen

- PostgreSQL + pgvector
- Qdrant
- Milvus
- ChromaDB

Varsayılan

PostgreSQL + pgvector

---

# Metadata

Her chunk aşağıdaki bilgileri içerir.

| Alan | Açıklama |
|---|---|
| Document ID | Benzersiz doküman kimliği |
| Tenant ID | Tesis kimliği |
| Module | İlgili modül |
| Author | Yazar |
| Version | Versiyon |
| Tags | Etiketler |
| Language | Dil |
| Created Date | Oluşturma tarihi |
| Updated Date | Güncelleme tarihi |

---

# Retrieval Süreci

```
Question
  ↓
Embedding
  ↓
Similarity Search
  ↓
Re-ranking
  ↓
Top-K Selection
  ↓
Prompt Builder
```

---

# Re-Ranking

İlk sonuçlar

↓

Skorlama

↓

En iyi belgeler seçilir.

---

# Hybrid Search

Desteklenecek

- Semantic Search
- Keyword Search
- BM25
- Metadata Filtering

---

# Filtreleme

Sorgular

- Tenant
- Modül
- Doküman Türü
- Dil
- Tarih
- Etiket

ile filtrelenebilir.

---

# Cache

Sık kullanılan sorgular

Redis üzerinde önbelleğe alınabilir.

---

# Güvenlik

RAG yalnızca

yetkili dokümanları kullanacaktır.

Tenant izolasyonu zorunludur.

---

# Kaynak Gösterimi

AI cevabı;

- Doküman Adı
- Bölüm
- Versiyon
- Sayfa (uygunsa)

bilgilerini döndürebilir.

---

# Performans

| Metrik | Hedef |
|---|---|
| Embedding | < 2 sn |
| Retrieval | < 300 ms |
| Re-ranking | < 200 ms |
| Toplam RAG | < 1 sn |

---

# Güncelleme

```
Yeni Doküman
  ↓
Embedding
  ↓
İndeks Güncelleme
  ↓
Arama Hazır
```

---

# İzleme

Takip edilecek metrikler

- Retrieval Süresi
- Precision
- Recall
- Cache Hit
- Ortalama Chunk Sayısı
- Token Kullanımı

---

# Gelecek

- Graph RAG
- Multi-Modal RAG
- Knowledge Graph
- Federated Search
- Incremental Indexing
- Cross-Tenant Shared Knowledge (Yetki kontrollü)
