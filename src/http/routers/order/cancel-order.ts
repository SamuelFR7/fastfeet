import { db } from '@/db/connection'
import { orders } from '@/db/schema/order'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const cancelOrder = new Elysia().use(authentication).patch(
  '/cancel/:id',
  async ({ getIsAdmin, set, params: { id } }) => {
    await getIsAdmin()

    const orderExistsQuery = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))

    const orderExists = orderExistsQuery[0]

    if (!orderExists) {
      set.status = 404
      return {
        body: {
          message: 'Order not found',
        },
      }
    }

    if (orderExists.status !== 'pending') {
      set.status = 400
      return {
        body: {
          message: 'Order cannot be cancelled',
        },
      }
    }

    const order = await db
      .update(orders)
      .set({
        status: 'cancelled',
      })
      .where(eq(orders.id, id))
      .returning()

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  {
    detail: {
      tags: ['Order'],
    },
  }
)
