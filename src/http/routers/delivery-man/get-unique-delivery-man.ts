import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const getUniqueDeliveryMan = new Elysia()
  .use(authentication)
  .get('/:id', async ({ getIsAdmin, set, params: { id } }) => {
    await getIsAdmin()

    const deliverymanQuery = await db
      .select({
        name: user.name,
        cpf: user.cpf,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(eq(user.id, id), eq(user.role, 'deliveryman')))

    const deliveryman = deliverymanQuery[0]

    if (!deliveryman) {
      set.status = 404

      return {
        body: {
          message: 'Deliveryman not found',
        },
      }
    }

    return new Response(JSON.stringify(deliveryman), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })
