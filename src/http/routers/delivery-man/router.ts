import Elysia from 'elysia'
import { createDeliveryMan } from './create-delivery-man'
import { deleteDeliveryMan } from './delete-delivery-man'
import { getUniqueDeliveryMan } from './get-unique-delivery-man'
import { listDeliveryMan } from './list-delivery-men'
import { listMyOrders } from './list-my-orders'
import { updateDeliveryMan } from './update-delivery-man'

export const deliveryManRouter = new Elysia({ prefix: '/deliveryman' })
  .use(createDeliveryMan)
  .use(deleteDeliveryMan)
  .use(getUniqueDeliveryMan)
  .use(listDeliveryMan)
  .use(listMyOrders)
  .use(updateDeliveryMan)
