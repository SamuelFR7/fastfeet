import { db } from '@/db/connection'
import { adresses, recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import Elysia, { t } from 'elysia'

export const createRecipient = new Elysia().use(authentication).post(
  '/',
  async ({ body }) => {
    const newAdress = await db
      .insert(adresses)
      .values({
        city: body.adressCity.toUpperCase(),
        complement: body.adressComplement?.toUpperCase(),
        number: body.adressNumber,
        state: body.adressState.toUpperCase(),
        street: body.adressStreet.toUpperCase(),
        zipCode: body.adressZipCode,
      })
      .returning({ id: adresses.id })

    await db.insert(recipients).values({
      name: body.name.toUpperCase(),
      cpf: body.cpf,
      adressId: newAdress[0].id,
      phone: body.phone,
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
      adressStreet: t.String(),
      adressNumber: t.String(),
      adressComplement: t.Optional(t.String()),
      adressCity: t.String(),
      adressState: t.String(),
      adressZipCode: t.String(),
    }),
    beforeHandle: async ({ getIsAdmin, set }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return 'Unauthorized'
      }
    },
  }
)
