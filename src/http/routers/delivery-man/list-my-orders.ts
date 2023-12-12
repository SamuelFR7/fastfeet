import { db } from '@/db/connection'
import { Order, addresses, orders, recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { asc, count, desc, eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const listMyOrders = new Elysia().use(authentication).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { sub } = await getCurrentUser()

    const page = parseInt(query.page) > 0 ? parseInt(query.page) : 1
    const limit = parseInt(query.limit) > 0 ? parseInt(query.limit) : 10

    const [column, order] =
      typeof query.sort === 'string'
        ? (query.sort.split('.') as [keyof Order | undefined, 'asc' | 'desc'])
        : []

    const ordersQuery = await db
      .select({
        id: orders.id,
        itemName: orders.itemName,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        address: {
          city: addresses.city,
          state: addresses.state,
          street: addresses.street,
          complement: addresses.complement,
          number: addresses.number,
          zipCode: addresses.zipCode,
        },
        recipient: {
          name: recipients.name,
          phone: recipients.phone,
        },
      })
      .from(orders)
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(
        column && column in orders
          ? order === 'asc'
            ? asc(orders[column])
            : desc(orders[column])
          : asc(orders.id)
      )
      .leftJoin(recipients, eq(orders.recipientId, recipients.id))
      .leftJoin(addresses, eq(recipients.addressId, addresses.id))
      .where(eq(orders.deliveryManId, sub))

    const totalCount = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.deliveryManId, sub))

    return new Response(
      JSON.stringify({
        orders: ordersQuery,
        totalCount,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  },
  {
    query: t.Object({
      page: t.String(),
      limit: t.String(),
      sort: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Delivery Man'],
    },
  }
)
