import { db } from '@/db/connection'
import { recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const getUniqueRecipient = new Elysia().use(authentication).get(
  '/:id',
  async ({ params: { id }, set }) => {
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

    return new Response(JSON.stringify(recipientExists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
  {
    beforeHandle: async ({ set, getIsAdmin }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return 'Unauthorized'
      }
    },
    detail: {
      tags: ['Recipient'],
    },
  }
)
