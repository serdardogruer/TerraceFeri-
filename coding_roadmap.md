# Kodlama Yol Haritası ve Öncelik Listesi

Projeyi modüler (mikroservis benzeri) bir yapıda geliştireceğimiz için, kodlamaya doğru temelden başlamak çok önemlidir. Yanlış sırayla ilerlersek, bir modülü kodlarken sürekli "bu daha hazır değil" engeliyle karşılaşırız. 

Aşağıda modüllerin birbirine olan bağımlılıklarına göre hazırlanmış, **Aciliyet / Öncelik Sırası** yer almaktadır. Lütfen bu listeyi inceleyin ve ilk olarak hangisinden başlamak istediğinizi seçin (Önerim Faz 1 ile başlamaktır).

## 🔴 FAZ 1: Çekirdek Yapı (Acil ve Zorunlu - Altyapı)
Sistemin beyni ve iskeleti. Diğer hiçbir modül bu faz tamamlanmadan çalışamaz.

- **[ ] TMM Core (Ana Çatı):** Next.js App Router klasör yapısının (apps/web, apps/tmm) kurulması.
- **[ ] Ortak Bileşenler (Shared Components):** Shadcn/UI, Tailwind kurulumu ve temel layout'un (Sidebar, Header) oluşturulması.
- **[ ] CoreDB (Kullanıcılar ve Auth):** `User` veritabanının Prisma şemasının kurulması.
- **[ ] Kimlik Doğrulama (Authentication):** JWT / NextAuth ile login/logout ve RBAC (Yetkilendirme) altyapısının yazılması.
- **[ ] API Gateway & Servis İskeleti:** Modüllerin birbirleriyle haberleşmesi için kullanılacak temel `fetch` veya `axios` servis mimarisinin kurulması.

## 🟠 FAZ 2: Temel Veri Modülleri (Öncelikli)
Sistemdeki diğer modüller (Arıza, Sayaç, Görev) çalışabilmek için bu modüllerdeki verilere ihtiyaç duyar.

- **[x] Daire Yönetimi Modülü (ApartmentDB):** Bloklar, daireler ve daire sakinleri. (Arızalar daireye bağlanır).
- **[x] Alan Yönetimi Modülü (AreaDB):** Sitedeki tesisler, katlar ve odalar. (Ekipmanlar ve sayaçlar alanlara bağlanır).
- **[x] Ekipman Yönetimi Modülü (EquipmentDB):** Sitedeki tüm demirbaş ve cihazlar. (Arızalar ve bakımlar ekipmanlara bağlanır).
- **[x] Servis Firmaları Modülü (CompanyDB):** Dışarıdan gelen servis firmalarının kaydı. (Arızalar bu firmalara atanır).

## 🟡 FAZ 3: Operasyonel Modüller
Temel modüller bittikten sonra günlük işleyişi yürütecek modüller.

- **[ ] Arıza Bildirim Modülü (FaultDB):** Arıza kayıtları, atanması, takibi ve çözülmesi. *(Faz 1 ve Faz 2 olmadan çok kısıtlı çalışır)*
- **[ ] Sayaç Okuma Modülü (MeterDB):** Elektrik, su, doğalgaz sayaç endekslerinin girilmesi.

- **[ ] Dosya Yönetimi Modülü (File Manager):** AWS S3 veya yerel sunucu tabanlı, diğer tüm modüllerin fotoğraf/belge yükleme ihtiyaçlarını karşılayan modül.

## 🟢 FAZ 4: İleri Seviye Özellikler ve Entegrasyonlar
Sistem ayağa kalktıktan sonra eklenecek özellikler.

- **[ ] Gerçek Zamanlı Bildirimler (Socket.IO):** Arıza geldiğinde veya çözüldüğünde anında bildirim düşmesi.
- **[ ] Raporlama Modülü:** Excel/PDF çıktıları ve Dashboard grafikleri.
- **[ ] Stok & Malzeme Yönetimi (InventoryDB).**

---

### Nasıl İlerleyelim?
> [!RECOMMENDATION]
> Sağlam bir temel için **Faz 1 -> TMM Core (Ana Çatı) ve Ortak Bileşenler** ile klasör mimarisini kurarak başlamamızı öneririm. Ardından Auth sistemini yazarız.
> 
> Lütfen **hangi kısımdan başlamak istediğinizi** belirtin. Seçiminize göre gerekli klasör yapısını kurup kodlamaya başlayacağım.
