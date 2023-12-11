import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const updateDeliveryMan = new Elysia().use(authentication).patch(
  '/:id',
  async ({ getIsAdmin, set, params: { id }, body }) => {
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

    await db
      .update(user)
      .set({
        name: body.name,
        cpf: body.cpf,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))

    return {
      status: 200,
      body: {
        message: 'Deliveryman updated successfully',
      },
    }
  },
  {
    body: t.Object({
      name: t.String(),
      cpf: t.String(),
    }),
  }
)
