# Terminal ve Komut Çalıştırma Kuralı

1. **Otonom Terminal Kullanımı:**
   - Terminal komutlarını kullanıcıya önermek veya kullanıcının terminaline yapıştırmasını istemek kesinlikle yasaktır.
   - Tüm komutlar Antigravity'nin kendi terminal aracı (`run_command`) ile bizzat ve otomatik çalıştırılmalıdır.

2. **Hata Analizi ve Otomatik Düzeltme:**
   - Komut çıktısı doğrudan okunmalı ve analiz edilmelidir.
   - Hata ile karşılaşıldığında kullanıcıya bildirmeden önce hata nedeni çözülmeli, ilgili dosyalar güncellenmeli ve komut tekrar çalıştırılarak doğrulanmalıdır.

3. **Doğrulama (Build / Test / Lint / DB):**
   - Kod değişikliklerinden sonra build, test, lint, prisma migrasyonları ve veritabanı kontrolleri bizzat terminal aracıyla doğrulanmalıdır.

4. **Kullanıcı Müdahalesi:**
   - Yalnızca dış kimlik doğrulama veya geri dönülemez kritik veri onayı gerektiren durumlarda kullanıcıya başvurulmalıdır.
