import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  migrate: {
    adapter: async () => {
      const { PrismaLibSQL } = await import('@prisma/adapter-libsql')
      const { createClient } = await import('@libsql/client')
      const client = createClient({ url: process.env.DATABASE_URL || 'file:./dev.db' })
      return new PrismaLibSQL(client)
    },
  },
})