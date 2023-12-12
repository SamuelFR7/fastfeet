import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const takeOrder = new Elysia().use(authentication).put(
  '/:id/take',
  async ({ set, getCurrentUser, params: { id } }) => {
    const currentUser = await getCurrentUser()

    if (currentUser.admin) {
      set.status = 401
      return {
        body: {
          message: 'Unauthorized',
        },
      }
    }

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

    if (orderExists.status !== 'available') {
      set.status = 400
      return {
        body: {
          message: 'Order cannot be taken',
        },
      }
    }

    await db
      .update(orders)
      .set({ status: 'picked_up', deliveryManId: currentUser.sub })
      .where(eq(orders.id, id))

    return new Response(
      JSON.stringify({
        message: 'Order taken',
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
    detail: {
      tags: ['Order'],
    },
  }
)
