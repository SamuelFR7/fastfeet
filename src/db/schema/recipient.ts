import { createId } from '@paralleldrive/cuid2'
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core'
import { adresses } from './adresses'

export const recipients = pgTable('recipients', {
  id: varchar('id', { length: 255 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 11 }).notNull(),
  phone: varchar('phone', { length: 11 }).notNull(),
  adressId: varchar('adress_id', { length: 255 })
    .references(() => adresses.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
})

export type RecipientInsert = typeof recipients.$inferInsert
