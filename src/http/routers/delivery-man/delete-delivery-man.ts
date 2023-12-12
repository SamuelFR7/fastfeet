import { db } from '@/db/connection'
import { user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const deleteDeliveryMan = new Elysia().use(authentication).delete(
  '/:id',
  async ({ getIsAdmin, set, params: { id } }) => {
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

    await db.delete(user).where(eq(user.id, id))

    return {
      status: 200,
      body: {
        message: 'Deliveryman deleted successfully',
      },
    }
  },
  {
    detail: {
      tags: ['Delivery Man'],
    },
  }
)
