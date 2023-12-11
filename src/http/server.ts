import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { bearer } from '@elysiajs/bearer'
import { authRouter } from './routers/auth'
import { env } from '@/env'
import { createDeliveryMan } from './routers/delivery-man/create-delivery-man'
import { deleteDeliveryMan } from './routers/delivery-man/delete-delivery-man'
import { getUniqueDeliveryMan } from './routers/delivery-man/get-unique-delivery-man'
import { listDeliveryMan } from './routers/delivery-man/list-delivery-men'
import { updateDeliveryMan } from './routers/delivery-man/update-delivery-man'
import { createOrder } from './routers/order/create-order'
import { cancelOrder } from './routers/order/cancel-order'
import { listAllOrders } from './routers/order/list-all-orders'

export const app = new Elysia()
  .use(bearer())
  .use(swagger())
  .use(authRouter)
  .use(createDeliveryMan)
  .use(deleteDeliveryMan)
  .use(getUniqueDeliveryMan)
  .use(listDeliveryMan)
  .use(updateDeliveryMan)
  .use(createOrder)
  .use(cancelOrder)
  .use(listAllOrders)

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
