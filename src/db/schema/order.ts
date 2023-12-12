import { createId } from '@paralleldrive/cuid2'
import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './user'
import { recipients } from './recipient'

export const status = pgEnum('status', [
  'pending',
  'available',
  'picked_up',
  'delivered',
  'cancelled',
])

export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  status: status('status').default('pending').notNull(),
  deliveryManId: varchar('delivery_man_id', { length: 255 }).references(
    () => user.id
  ),
  recipientId: varchar('recipient_id', { length: 255 })
    .references(() => recipients.id)
    .notNull(),
  deliveredImageKey: varchar('delivered_image_key', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

export type Order = typeof orders.$inferSelect
export type InsertOrder = typeof orders.$inferInsert
