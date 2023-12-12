import { db } from '@/db/connection'
import { Order, orders } from '@/db/schema/order'
import { authentication } from '@/http/authentication'
import { asc, count, desc, ne } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const listAllOrders = new Elysia().use(authentication).get(
  '/',
  async ({ getIsAdmin, query }) => {
    await getIsAdmin()

    const [column, order] = query.sort.split('.') as [
      keyof Order | undefined,
      'asc' | 'desc' | undefined,
    ]

    const page = parseInt(query.page) > 0 ? parseInt(query.page) : 1
    const limit = parseInt(query.limit) > 0 ? parseInt(query.limit) : 10

    const ordersQuery = await db
      .select()
      .from(orders)
      .where(ne(orders.status, 'cancelled'))
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(
        column && column in orders
          ? order === 'asc'
            ? asc(orders[column])
            : desc(orders[column])
          : desc(orders.id)
      )

    const totalCount = await db
      .select({
        count: count(orders.id),
      })
      .from(orders)
      .where(ne(orders.status, 'cancelled'))

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
      sort: t.String(),
    }),
    detail: {
      tags: ['Order'],
    },
  }
)
