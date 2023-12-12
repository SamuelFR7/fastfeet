import Elysia, { t } from 'elysia'
import { user } from '@/db/schema/user'
import { db } from '@/db/connection'
import { eq } from 'drizzle-orm'
import { compare, hash } from 'bcryptjs'
import { authentication } from '../authentication'

export const authRouter = new Elysia().use(authentication)

authRouter.post(
  '/auth/session',
  async ({ body, signInUser }) => {
    const userExistsQuery = await db
      .select()
      .from(user)
      .where(eq(user.cpf, body.cpf))

    const userExists = userExistsQuery[0]

    if (!userExists) {
      return {
        status: 401,
        body: {
          message: 'Invalid username or password',
        },
      }
    }

    const passwordMatches = compare(body.password, userExists.password)

    if (!passwordMatches) {
      return {
        status: 401,
        body: {
          message: 'Invalid username or password',
        },
      }
    }

    const token = await signInUser({
      sub: userExists.id,
      admin: userExists.role === 'admin',
    })

    return new Response(
      JSON.stringify({
        token,
        user: {
          role: userExists.role,
        },
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
      cpf: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ['Auth'],
    },
  }
)

authRouter.put(
  '/auth/:id/change-password',
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
  }
)
