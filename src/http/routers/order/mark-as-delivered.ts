import { db } from '@/db/connection'
import { orders, recipients } from '@/db/schema'
import { env } from '@/env'
import { authentication } from '@/http/authentication'
import { resend } from '@/mail/client'
import { NotificateRecipientTemplate } from '@/mail/templates/notificate-recipient'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { UTApi } from 'uploadthing/server'

export const utapi = new UTApi()

export const markAsDelivered = new Elysia().use(authentication).put(
  '/:id/delivered',
  async ({ set, getCurrentUser, params: { id }, body: { file } }) => {
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
        deliveryManId: orders.deliveryManId,
      })
      .from(orders)
      .leftJoin(recipients, eq(orders.recipientId, recipients.id))
      .where(eq(orders.id, id))

    const orderExists = orderExistsQuery[0]

    if (!orderExists) {
      set.status = 404
      return {
        message: 'Order not found',
      }
    }

    if (orderExists.status !== 'picked_up') {
      set.status = 400
      return {
        message: 'Order cannot be delivered',
      }
    }

    if (orderExists.deliveryManId !== currentUser.sub) {
      set.status = 401
      return {
        message: 'Unauthorized',
      }
    }

    const uploaded = await utapi.uploadFiles(file)

    if (uploaded.error) {
      set.status = 400
      return {
        message: 'Error uploading image',
      }
    }

    const updatedOrder = await db
      .update(orders)
      .set({ status: 'delivered', deliveredImageKey: uploaded.data.key })
      .where(eq(orders.id, id))
      .returning()

    if (orderExists.email && orderExists.name) {
      await resend.emails.send({
        from: `FastFeet <${env.MAIL_FROM}>`,
        to: orderExists.email,
        subject: `Your order has been delivered`,
        react: NotificateRecipientTemplate({
          name: orderExists.name,
          order: updatedOrder[0],
        }),
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Order delivered',
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
    body: t.Object({
      file: t.File({
        type: ['image/jpeg', 'image/png'],
        maxSize: '1m',
      }),
    }),
    detail: {
      tags: ['Order'],
    },
  }
)
