import Elysia, { Static, t } from 'elysia'
import { UnauthorizedError } from './routers/errors/unauthorized-error'
import { NotAdminError } from './routers/errors/not-a-admin-error'
import jwt from '@elysiajs/jwt'
import { env } from '@/env'
import bearer from '@elysiajs/bearer'

const jwtPayloadSchema = t.Object({
  sub: t.String(),
  admin: t.Boolean(),
})

export const authentication = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    NOT_A_ADMIN: NotAdminError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
      case 'NOT_A_ADMIN':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      schema: jwtPayloadSchema,
      exp: '1d',
    })
  )
  .use(bearer())
  .derive(({ jwt, bearer }) => {
    return {
      getCurrentUser: async () => {
        const payload = await jwt.verify(bearer)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return payload
      },
      signInUser: async (payload: Static<typeof jwtPayloadSchema>) => {
        const token = await jwt.sign(payload)

        return token
      },
    }
  })
  .derive(({ getCurrentUser }) => {
    return {
      getIsAdmin: async () => {
        const { admin } = await getCurrentUser()

        if (!admin) {
          throw new NotAdminError()
        }

        return true
      },
    }
  })
