import { PrismaClient } from '@prisma-clients/personnel'

const globalForPrisma = globalThis as unknown as {
  prismaPersonnel: PrismaClient | undefined
}

const dbUrl = process.env.PERSONNEL_DATABASE_URL || process.env.DATABASE_URL;

export const prismaPersonnel =
  globalForPrisma.prismaPersonnel ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPersonnel = prismaPersonnel
}

export default prismaPersonnel;
