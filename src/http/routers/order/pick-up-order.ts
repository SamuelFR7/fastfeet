import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const pickUpOrder = new Elysia().use(authentication).put(
  '/:id/pickup',
  async ({ set, getCurrentUser, params: { id } }) => {
    const currentUser = await getCurrentUser()

    if (currentUser.admin) {
      set.status = 401
      return {
        message: 'Unauthorized',
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
        message: 'Order cannot be picked up',
      }
    }

    await db
      .update(orders)
      .set({ status: 'picked_up', deliveryManId: currentUser.sub })
      .where(eq(orders.id, id))

    return new Response(
      JSON.stringify({
        message: 'Order picked up',
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
