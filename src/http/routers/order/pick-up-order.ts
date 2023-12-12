import { db } from '@/db/connection'
import { orders, recipients } from '@/db/schema'
import { env } from '@/env'
import { authentication } from '@/http/authentication'
import { resend } from '@/mail/client'
import { NotificateRecipientTemplate } from '@/mail/templates/notificate-recipient'
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
      .select({
        email: recipients.email,
        name: recipients.name,
        status: orders.status,
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

    if (orderExists.status !== 'available') {
      set.status = 400
      return {
        message: 'Order cannot be picked up',
      }
    }

    const updatedOrder = await db
      .update(orders)
      .set({ status: 'picked_up', deliveryManId: currentUser.sub })
      .where(eq(orders.id, id))
      .returning()

    if (orderExists.email && orderExists.name) {
      await resend.emails.send({
        from: `FastFeet <${env.MAIL_FROM}>`,
        to: orderExists.email,
        subject: `Your order has been picked up by the delivery man`,
        react: NotificateRecipientTemplate({
          name: orderExists.name,
          order: updatedOrder[0],
        }),
      })
    }

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
