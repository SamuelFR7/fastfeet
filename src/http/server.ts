import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { bearer } from '@elysiajs/bearer'
import { authRouter } from './routers/auth'
import { env } from '@/env'
import { createDeliveryMan } from './routers/delivery/create-delivery-man'
import { deleteDeliveryMan } from './routers/delivery/delete-delivery-man'
import { getUniqueDeliveryMan } from './routers/delivery/get-unique-delivery-man'
import { listDeliveryMan } from './routers/delivery/list-delivery-men'
import { updateDeliveryMan } from './routers/delivery/update-delivery-man'

export const app = new Elysia()
  .use(bearer())
  .use(swagger())
  .use(authRouter)
  .use(createDeliveryMan)
  .use(deleteDeliveryMan)
  .use(getUniqueDeliveryMan)
  .use(listDeliveryMan)
  .use(updateDeliveryMan)

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
