import { db } from '@/db/connection'
import { orders, recipients } from '@/db/schema'
import { env } from '@/env'
import { authentication } from '@/http/authentication'
import { resend } from '@/mail/client'
import { NotificateRecipientTemplate } from '@/mail/templates/notificate-recipient'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const markAsAvailable = new Elysia().use(authentication).put(
  '/:id/available',
  async ({ set, params: { id } }) => {
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

    if (orderExists.status !== 'pending') {
      set.status = 400
      return {
        body: {
          message: 'Order cannot be mark as available',
        },
      }
    }

    const updatedOrder = await db
      .update(orders)
      .set({ status: 'available' })
      .where(eq(orders.id, id))
      .returning()

    if (orderExists.email && orderExists.name) {
      await resend.emails.send({
        from: `FastFeet <${env.MAIL_FROM}>`,
        to: orderExists.email,
        subject: `Your order has been confirmed`,
        react: NotificateRecipientTemplate({
          name: orderExists.name,
          order: updatedOrder[0],
        }),
      })
    }

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
