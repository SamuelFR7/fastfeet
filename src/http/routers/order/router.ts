import Elysia from 'elysia'
import { cancelOrder } from './cancel-order'
import { createOrder } from './create-order'
import { editOrder } from './edit-order'
import { getUniqueOrder } from './get-unique-order'
import { listAllOrders } from './list-all-orders'

export const ordersRouter = new Elysia({ prefix: '/order' })
  .use(cancelOrder)
  .use(createOrder)
  .use(editOrder)
  .use(getUniqueOrder)
  .use(listAllOrders)
