import { db } from '@/db/connection'
import { recipients } from '@/db/schema'
import { orders } from '@/db/schema/order'
import { env } from '@/env'
import { authentication } from '@/http/authentication'
import { resend } from '@/mail/client'
import { NotificateRecipientTemplate } from '@/mail/templates/notificate-recipient'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const cancelOrder = new Elysia().use(authentication).patch(
  '/cancel/:id',
  async ({ getIsAdmin, set, params: { id } }) => {
    await getIsAdmin()

    const orderExistsQuery = await db
      .select({
        email: recipients.email,
        name: recipients.name,
        status: orders.status,
        deliveryManId: orders.deliveryManId,
      })
      .from(orders)
      .leftJoin(recipients, eq(orders.recipientId, recipients.id))
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

    const updatedOrder = await db
      .update(orders)
      .set({
        status: 'cancelled',
      })
      .where(eq(orders.id, id))
      .returning()

    if (orderExists.email && orderExists.name) {
      await resend.emails.send({
        from: `FastFeet <${env.MAIL_FROM}>`,
        to: orderExists.email,
        subject: `Your order has been cancelled`,
        react: NotificateRecipientTemplate({
          name: orderExists.name,
          order: updatedOrder[0],
        }),
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Order cancelled',
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
