import { db } from '@/db/connection'
import { recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const updateRecipient = new Elysia().use(authentication).patch(
  '/:id',
  async ({ params: { id }, set, body }) => {
    const recipientExistsQuery = await db
      .select()
      .from(recipients)
      .where(eq(recipients.id, id))

    const recipientExists = recipientExistsQuery[0]

    if (!recipientExists) {
      set.status = 404
      return {
        message: 'Recipient not found',
      }
    }

    await db.update(recipients).set({
      cpf: body.cpf,
      name: body.name?.toUpperCase(),
      phone: body.phone,
      updatedAt: new Date(),
    })

    return new Response(
      JSON.stringify({
        message: 'Recipient updated',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
  {
    beforeHandle: async ({ set, getIsAdmin }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return 'Unauthorized'
      }
    },
    body: t.Object({
      name: t.Optional(t.String()),
      cpf: t.Optional(t.String()),
      phone: t.Optional(t.String()),
    }),
  }
)
