import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { bearer } from '@elysiajs/bearer'
import { authRouter } from './routers/auth/router'
import { env } from '@/env'
import { deliveryManRouter } from './routers/delivery-man/router'
import { ordersRouter } from './routers/order/router'
import { recipientRouter } from './routers/recipient/router'

export const app = new Elysia().use(bearer()).use(swagger())

app.group('/api/v1', (app) =>
  app
    .use(authRouter)
    .use(deliveryManRouter)
    .use(ordersRouter)
    .use(recipientRouter)
)

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
