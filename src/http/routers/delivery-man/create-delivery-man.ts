import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const createDeliveryMan = new Elysia().use(authentication).post(
  '/',
  async ({ getIsAdmin, body, set }) => {
    await getIsAdmin()

    const userAlreadyExists = await db
      .select()
      .from(user)
      .where(eq(user.cpf, body.cpf))

    if (userAlreadyExists[0]) {
      set.status = 409

      return {
        body: {
          message: 'User already exists',
        },
      }
    }

    const hashedPassword = await hash(body.password, 8)

    await db.insert(user).values({
      cpf: body.cpf,
      name: body.name,
      password: hashedPassword,
      role: 'deliveryman',
    })

    return {
      status: 201,
      body: {
        message: 'User created successfully',
      },
    }
  },
  {
    body: t.Object({
      name: t.String(),
      cpf: t.String(),
      password: t.String(),
    }),
    headers: t.Object({
      authorization: t.String(),
    }),
  }
)
