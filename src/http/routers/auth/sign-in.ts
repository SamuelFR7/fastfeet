import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const signIn = new Elysia().use(authentication).post(
  '/session',
  async ({ signInUser, set, body }) => {
    const { cpf, password } = body

    const userExistsQuery = await db
      .select()
      .from(user)
      .where(eq(user.cpf, cpf))

    const userExists = userExistsQuery[0]

    if (!userExists) {
      set.status = 401
      return {
        message: 'Invalid username or password',
      }
    }

    const passwordMatches = compare(password, userExists.password)

    if (!passwordMatches) {
      set.status = 401
      return {
        message: 'Invalid username or password',
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
