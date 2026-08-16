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
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@terraceferi.com';
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.argv[4] || process.env.ADMIN_NAME || 'Sistem Yöneticisi';

  console.log('====================================================');
  console.log('👤 TerraceFeri - İlk Admin Kullanıcı Oluşturuluyor');
  console.log('====================================================');
  console.log(`Email: ${email}`);
  console.log(`İsim:  ${name}`);
  console.log('----------------------------------------------------');

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log(`ℹ️ "${email}" kullanıcısı zaten mevcut. Şifre ve rol güncelleniyor...`);
      const updated = await prisma.user.update({
        where: { email },
        data: {
          name,
          password,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Kullanıcı başarıyla güncellendi:', updated.id);
    } else {
      const created = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('🎉 İlk Admin kullanıcı başarıyla oluşturuldu!');
      console.log(`Kullanıcı ID: ${created.id}`);
    }

    console.log('====================================================');
    console.log(`Giriş Bilgileri:`);
    console.log(`E-posta: ${email}`);
    console.log(`Şifre:   ${password}`);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Admin kullanıcı oluşturulurken hata:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
