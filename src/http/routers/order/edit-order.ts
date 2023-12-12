import { db } from '@/db/connection'
import { orders } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const editOrder = new Elysia().use(authentication).patch(
  '/:id',
  async ({ getIsAdmin, params: { id }, body, set }) => {
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

    const order = await db
      .update(orders)
      .set({
        itemName: body.itemName,
      })
      .returning()

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  {
    body: t.Object({
      itemName: t.String(),
    }),
    detail: {
      tags: ['Order'],
    },
  }
)
