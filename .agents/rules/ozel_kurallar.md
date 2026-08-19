# Özel Kurallar

1. **Modül Eklenmesi:** Eklenen her yeni modül hem sol menüye (Sidebar) hem de Ayarlar (`/admin/settings`) sayfasına mutlaka eklenecektir. Hiçbir modül sadece birinde bırakılmamalıdır.
2. **Pop-up (Modal) Buton Yerleşimi:** Tüm pop-up ekranlarında; **Sil (Delete)** butonu sol üst köşede (başlığın yanında) yer alacaktır. Alt kısımdaki aksiyon butonları ise sağ alt köşede bulunacak olup; **İptal** solda, **Kaydet / Güncelle** en sağda yan yana konumlandırılacaktır.
3. **Standart Buton Tasarım Sistemi:** Sistem genelindeki tüm butonlar; koyu/şeffaf zemin üzerine renkli ince kenarlık (border), kenarlıkla uyumlu renkli metin (text) ve **hafif yuvarlatılmış köşe (`rounded-lg` / `rounded-xl`)** formatında olacaktır.
   - ❌ **Yasak:** İçi tamamen parlak dolu (flat) veya parlak gradient (`bg-gradient-to-r`, `bg-blue-600`) renkler kesinlikle kullanılmayacaktır.
   - ❌ **Yasak:** Hap şeklindeki tam yuvarlak (`rounded-full`) butonlar kullanılmayacaktır.
   - ✅ **Ana / Ekle Butonları (Header Primary Action):**
     ```html
     <!-- İndigo/Mor Tema -->
     class="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
     
     <!-- Mavi/Cyan Tema -->
     class="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-blue-900/10 hover:bg-blue-900/30 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
     ```
   - ✅ **İkincil / Rapor / Filtre Butonları (Secondary Action):**
     ```html
     class="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
     ```
   - ✅ **Kart İçi / Satır Aksiyon Butonları (Tablo İçi İşlemler):**
     ```html
     <!-- Düzenle: -->
     class="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
     <!-- Sil: -->
     class="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
     ```
   - ✅ **Pop-up (Modal) İçi Butonlar:**
     ```html
     <!-- Sol Üst Köşe Sil Butonu: -->
     class="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
     
     <!-- Sağ Alt İptal Butonu: -->
     class="px-5 py-2 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
     
     <!-- Sağ Alt Kaydet / Güncelle Butonu: -->
     class="flex items-center px-6 py-2 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm"
     ```

4. **Tablo ve Liste Satır Kartı Tasarım Standardı (Data Box Mimarisi):**
   - Tüm liste ekranlarındaki satırlar (Alanlar, Daireler, Arızalar, Yönetim Masası vb.) **Resim 3'teki Data Box (Veri Kutucukları)** mimarisinde olacaktır.
   - Her satırda sadece en temel ve gerekli veriler ferah kutucuklar içinde gösterilir (Örn: **TARİH**, **TÜR**, **TALEP / KONU**, **MALİYET / İÇERİK**):
     - Üstte etiket (Label): `text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5`
     - Kutu yapısı: `flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-3`
     - Değer metni (Value): Veri tipine göre belirgin tematik renk (Beyaz, Mor, Cyan, Sarı vb.).
   - Sağdaki aksiyon butonları bağımsız `w-10 h-10` kare kutucuklar şeklinde olacaktır (Satırda paylaş butonu olmaz; Yazdır, Düzenle, Sil ve Detay bulunur):
     - Yazdır / PDF: `w-10 h-10 bg-[#070A11] border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center`
     - Düzenle: `w-10 h-10 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg flex items-center justify-center`
     - Sil: `w-10 h-10 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg flex items-center justify-center`
     - Detay / Genişlet: `w-10 h-10 bg-[#070A11] border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center`

5. **Filtre ve Sekme (Tab) Butonları Standardı:**
   - Asla içi dolu parlak veya yuvarlak hap buton (`bg-indigo-600 rounded-full`) kullanılmayacaktır.
   - **Aktif Sekme:** `px-4 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm`
   - **Pasif Sekme:** `px-4 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold`

6. **Terminal ve Komut Çalıştırma Standardı:**
   - Terminal komutlarını kullanıcıya önermek veya kullanıcıdan çalıştırmasını istemek yasaktır.
   - Tüm terminal komutları Antigravity'nin kendi terminal aracı (`run_command`) ile bizzat çalıştırılacaktır.
   - Çıktılar otomatik okunacak, hata oluşursa hata analiz edilecek, ilgili dosyalar düzeltilecek ve komut tekrar çalıştırılacaktır.
   - Derleme (build), test, lint, prisma migrasyonları ve script doğrulamaları bizzat gerçekleştirilecektir.
   - Kullanıcıdan yalnızca kaçınılmaz insan onayı / dış müdahale gerektiren durumlarda yardım istenecektir.

7. **Geliştirme & Dağıtım (Deploy) Standardı:**
   - Tüm geliştirme, hata düzeltme, tasarım ve test işlemleri yalnızca **Lokal Ortamda (`http://localhost:3005`)** yapılacaktır.
   - Kullanıcı açıkça "deploy et", "canlıya al" veya "sunucuya yükle" talimatı vermedikçe canlı VDS sunucusuna ASLA dağıtım yapılmayacaktır.
