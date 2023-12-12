import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const markAsAvailable = new Elysia().use(authentication).put(
  '/:id/available',
  async ({ set, params: { id } }) => {
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
          message: 'Order cannot be mark as available',
        },
      }
    }

    await db
      .update(orders)
      .set({ status: 'available' })
      .where(eq(orders.id, id))

    return new Response(
      JSON.stringify({ message: 'Order marked as available' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  },
  {
    beforeHandle: async ({ getIsAdmin, set }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return {
          message: 'Unauthorized',
        }
      }
    },
    detail: {
      tags: ['Order'],
    },
  }
)
