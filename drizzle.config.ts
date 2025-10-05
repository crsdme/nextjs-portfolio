import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schemas/',
  out: './drizzle',
  // eslint-disable-next-line node/prefer-global/process
  dbCredentials: { url: process.env.DATABASE_URL! },
})
