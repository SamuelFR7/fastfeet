import { createId } from '@paralleldrive/cuid2'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const addresses = pgTable('addresses', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  street: varchar('street', { length: 255 }).notNull(),
  number: varchar('number', { length: 255 }).notNull(),
  complement: varchar('complement', { length: 255 }),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  zipCode: varchar('zip_code', { length: 255 }).notNull(),
})

export type AddressInsert = typeof addresses.$inferInsert
