import { db } from '@/db/connection'
import { recipients } from '@/db/schema'
import { orders } from '@/db/schema/order'
import { env } from '@/env'
import { authentication } from '@/http/authentication'
import { resend } from '@/mail/client'
import { NotificateRecipientTemplate } from '@/mail/templates/notificate-recipient'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const createOrder = new Elysia().use(authentication).post(
  '/',
  async ({ getIsAdmin, body, set }) => {
    await getIsAdmin()

    const recipientExistsQuery = await db
      .select({ email: recipients.email, name: recipients.name })
      .from(recipients)
      .where(eq(recipients.id, body.recipientId))

    const recipientExists = recipientExistsQuery[0]

    if (!recipientExists) {
      set.status = 404
      return {
        message: 'Recipient not found',
      }
    }

    const updatedOrder = await db
      .insert(orders)
      .values({
        itemName: body.itemName,
        recipientId: body.recipientId,
      })
      .returning()

    await resend.emails.send({
      from: `FastFeet <${env.MAIL_FROM}>`,
      to: recipientExists.email,
      subject: `Your order has been cancelled`,
      react: NotificateRecipientTemplate({
        name: recipientExists.name,
        order: updatedOrder[0],
      }),
    })

    return new Response(
      JSON.stringify({
        message: 'Order created',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  },
  {
    body: t.Object({
      itemName: t.String(),
      recipientId: t.String(),
    }),
    detail: {
      tags: ['Order'],
    },
  }
)
