import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const listDeliveryMan = new Elysia()
  .use(authentication)
  .get('/api/v1/deliveryman', async ({ getIsAdmin }) => {
    await getIsAdmin()

    const deliverymenQuery = await db
      .select({
        name: user.name,
        cpf: user.cpf,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.role, 'deliveryman'))

    const deliverymen = deliverymenQuery

    return new Response(JSON.stringify(deliverymen), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })
