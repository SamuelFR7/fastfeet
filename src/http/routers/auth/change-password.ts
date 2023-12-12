import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const changePassword = new Elysia().use(authentication).put(
  '/:id/change-password',
  async ({ body, params: { id }, set }) => {
    const userExistsQuery = await db.select().from(user).where(eq(user.id, id))

    const userExists = userExistsQuery[0]

    if (!userExists) {
      set.status = 404
      return {
        body: {
          message: 'User not found',
        },
      }
    }

    const { newPassword } = body

    const hashedPassword = await hash(newPassword, 8)

    await db
      .update(user)
      .set({
        password: hashedPassword,
      })
      .where(eq(user.id, id))

    return new Response(
      JSON.stringify({
        message: 'Password changed successfully',
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
    beforeHandle: async ({ set, getIsAdmin }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return {
          message: 'Unauthorized',
        }
      }
    },
    body: t.Object({
      newPassword: t.String(),
    }),
    detail: {
      tags: ['Auth'],
    },
  }
)
