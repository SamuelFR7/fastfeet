import { db } from '@/db/connection'
import { orders } from '@/db/schema/order'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'

export const createOrder = new Elysia().use(authentication).post(
  '/api/v1/order',
  async ({ getIsAdmin, body }) => {
    await getIsAdmin()

    const order = await db
      .insert(orders)
      .values({
        itemName: body.itemName,
      })
      .returning()

    return new Response(JSON.stringify(order), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  {
    body: t.Object({
      itemName: t.String(),
    }),
  }
)
