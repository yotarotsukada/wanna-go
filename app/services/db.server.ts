import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql'

declare global {
  var __db__: PrismaClient;
}

let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Setup
  const connectionString = `${process.env.TURSO_DATABASE_URL}`
  const authToken = `${process.env.TURSO_AUTH_TOKEN}`

  // Init prisma client
  const adapter = new PrismaLibSQL({
    url: connectionString,
    authToken,
  })
  const prisma = new PrismaClient({ adapter })
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  db = global.__db__;
}

export { db };