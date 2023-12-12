import { Order } from '@/db/schema'
import {
  Body,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'

interface NotificateRecipientTemplateProps {
  name: string
  order: Order
}

export function NotificateRecipientTemplate({
  order,
  name,
}: NotificateRecipientTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Delivery status updated</Preview>
      <Tailwind>
        <Body className="bg-white mx-auto my-auto font-sans">
          <Heading as="h1">
            Hello {name}, your order with code #{order.id} updated the status.
          </Heading>
          <Text>Your order is now {getDeliveryStatus(order.status)}</Text>
        </Body>
      </Tailwind>
    </Html>
  )
}

function getDeliveryStatus(status: string) {
  switch (status) {
    case 'pending':
      return 'waiting confirmation'
    case 'available':
      return 'awaiting pickup'
    case 'picked_up':
      return 'in the delivery process'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'updated'
  }
}
