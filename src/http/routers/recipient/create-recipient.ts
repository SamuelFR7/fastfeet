import { db } from '@/db/connection'
import { addresses, recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'

export const createRecipient = new Elysia().use(authentication).post(
  '/',
  async ({ body }) => {
    const newAddress = await db
      .insert(addresses)
      .values({
        city: body.addressCity.toUpperCase(),
        complement: body.addressComplement?.toUpperCase(),
        number: body.addressNumber,
        state: body.addressState.toUpperCase(),
        street: body.addressStreet.toUpperCase(),
        zipCode: body.addressZipCode,
      })
      .returning({ id: addresses.id })

    await db.insert(recipients).values({
      name: body.name.toUpperCase(),
      cpf: body.cpf,
      addressId: newAddress[0].id,
      phone: body.phone,
      email: body.email,
    })

    return new Response(JSON.stringify({ message: 'Recipient created' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  },
  {
    body: t.Object({
      name: t.String(),
      cpf: t.String(),
      phone: t.String(),
      addressStreet: t.String(),
      addressNumber: t.String(),
      addressComplement: t.Optional(t.String()),
      addressCity: t.String(),
      addressState: t.String(),
      addressZipCode: t.String(),
      email: t.String(),
    }),
    beforeHandle: async ({ getIsAdmin, set }) => {
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
