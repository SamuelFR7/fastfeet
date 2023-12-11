import { createId } from '@paralleldrive/cuid2'
import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { user } from './user'

const status = pgEnum('status', [
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})