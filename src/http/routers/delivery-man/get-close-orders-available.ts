import { db } from '@/db/connection'
import { addresses, orders, recipients, user } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { and, eq } from 'drizzle-orm'
import Elysia from 'elysia'

export const getCloseOrdersAvailable = new Elysia().use(authentication).get(
  '/orders/close',
  async ({ getCurrentUser, set }) => {
    const { sub, admin } = await getCurrentUser()

    if (admin) {
      set.status = 401
      return 'Unauthorized'
    }

    const deliveryManQuery = await db
      .select()
      .from(user)
      .leftJoin(addresses, eq(user.addressId, addresses.id))
      .where(eq(user.id, sub))

    const deliveryMan = deliveryManQuery[0]

    if (!deliveryMan) {
      set.status = 404
      return {
        message: 'User not found',
      }
    }

    if (!deliveryMan.addresses) {
      set.status = 404
      return {
        message: 'User address not found',
      }
    }

    const ordersQuery = await db
      .select({
        id: orders.id,
        itemName: orders.itemName,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        address: {
          city: addresses.city,
          state: addresses.state,
          street: addresses.street,
          complement: addresses.complement,
          number: addresses.number,
          zipCode: addresses.zipCode,
        },
        recipient: {
          name: recipients.name,
          phone: recipients.phone,
        },
      })
      .from(orders)
      .leftJoin(recipients, eq(orders.recipientId, recipients.id))
      .leftJoin(addresses, eq(recipients.addressId, addresses.id))
      .where(
        and(
          eq(addresses.state, deliveryMan.addresses.state),
          eq(orders.status, 'available')
        )
      )

    return new Response(
      JSON.stringify({
        orders: ordersQuery,
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
    detail: {
      tags: ['Delivery Man'],
    },
  }
)
