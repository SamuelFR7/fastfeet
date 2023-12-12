import Elysia from 'elysia'
import { cancelOrder } from './cancel-order'
import { createOrder } from './create-order'
import { editOrder } from './edit-order'
import { getUniqueOrder } from './get-unique-order'
import { listAllOrders } from './list-all-orders'
import { markAsAvailable } from './mark-as-available'
import { markAsDelivered } from './mark-as-delivered'
import { pickUpOrder } from './pick-up-order'

export const ordersRouter = new Elysia({ prefix: '/order' })
  .use(cancelOrder)
  .use(createOrder)
  .use(editOrder)
  .use(getUniqueOrder)
  .use(listAllOrders)
  .use(markAsAvailable)
  .use(pickUpOrder)
  .use(markAsDelivered)
