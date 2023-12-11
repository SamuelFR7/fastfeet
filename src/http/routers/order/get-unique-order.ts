import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const getUniqueOrder = new Elysia()
  .use(authentication)
  .get('/api/v1/order/:id', async ({ getCurrentUser, params: { id }, set }) => {
    const { admin, sub } = await getCurrentUser()

    const orderQuery = await db.select().from(orders).where(eq(orders.id, id))

    const order = orderQuery[0]
    if (!order) {
      set.status = 404
      return {
        body: {
          message: 'Order not found',
        },
      }
    }

    if (!admin && order.deliveryManId !== sub) {
      set.status = 403
      return {
        body: {
          message: 'You are not allowed to access this resource',
        },
      }
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })
