/**
 * TerraceFeri - İlk Admin Kullanıcı Tohumlama Scripti (Seed Script)
 * Usage: node scripts/seed-admin.js [email] [password] [name]
 */

const { PrismaClient } = require('@prisma-clients/core');

const dbUrl = process.env.CORE_DATABASE_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {})
});

async function main() {
  const usersToSeed = [
    {
      email: 'serdardogruer@gmail.com',
      password: 'dgrr1213',
      name: 'Serdar DOĞRUER',
      role: 'ADMIN'
    },
    {
      email: 'serdar@terraceferi.com',
      password: 'dgrr1213',
      name: 'Serdar DOĞRUER',
      role: 'ADMIN'
    },
    {
      email: 'admin@terraceferi.com',
      password: 'dgrr1213',
      name: 'Sistem Yöneticisi',
      role: 'ADMIN'
    }
  ];

  console.log('====================================================');
  console.log('👤 TerraceFeri - Admin Kullanıcılar Tohumlanıyor');
  console.log('====================================================');

  try {
    for (const u of usersToSeed) {
      console.log(`Kontrol ediliyor: ${u.email} (${u.name})`);
      const existing = await prisma.user.findUnique({
        where: { email: u.email }
      });

      if (existing) {
        console.log(`ℹ️ "${u.email}" kullanıcısı mevcut. Bilgiler güncelleniyor...`);
        const updated = await prisma.user.update({
          where: { email: u.email },
          data: {
            name: u.name,
            password: u.password,
            role: u.role,
            status: 'ACTIVE'
          }
        });
        console.log('✅ Kullanıcı güncellendi:', updated.id);
      } else {
        const created = await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            status: 'ACTIVE'
          }
        });
        console.log('🎉 Kullanıcı oluşturuldu:', created.id);
      }
    }

    console.log('====================================================');
    console.log('✨ Tüm Admin kullanıcıları başarıyla hazırlandı:');
    console.log('👤 Serdar DOĞRUER (serdardogruer@gmail.com) -> Şifre: dgrr1213');
    console.log('====================================================');
  } catch (err) {
    console.warn('⚠️ Prisma veritabanına bağlanılamadı (fallback auth devrede):', err.message);
  } finally {
    try {
      await prisma.$disconnect();
    } catch {}
  }
}

main();
