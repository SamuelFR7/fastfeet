import { user } from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'
import { hashSync } from 'bcryptjs'
import { InsertOrder, orders } from './schema/order'

/**
 * Reset database
 */
await db.delete(orders)
await db.delete(user)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create deliverymen and a admin
 */
const [deliveryMan1, deliveryMan2] = await db
  .insert(user)
  .values([
    {
      name: faker.person.fullName().toUpperCase(),
      role: 'deliveryman',
      cpf: faker.string.numeric('###########'),
      password: hashSync('123456', 8),
    },
    {
      name: faker.person.fullName().toUpperCase(),
      role: 'deliveryman',
      cpf: faker.string.numeric('###########'),
      password: hashSync('123456', 8),
    },
    {
      name: 'SAMUEL REZENDE',
      role: 'admin',
      cpf: '12312312312',
      password: hashSync('123456', 8),
    },
  ])
  .returning()

console.log(chalk.yellow('✔ Created delivery men'))

function generateOrders() {
  const orders: InsertOrder[] = []

  for (let i = 0; i < 200; i++) {
    orders.push({
      itemName: faker.commerce.productName().toUpperCase(),
      createdAt: faker.date.past(),
      deliveryManId: faker.helpers.arrayElement([
        deliveryMan1.id,
        deliveryMan2.id,
      ]),
      status: faker.helpers.arrayElement([
        'pending',
        'available',
        'picked_up',
        'delivered',
        'cancelled',
      ]),
    })
  }

  return orders
}

/**
 * Create orders
 */
const ordersToInsert = generateOrders()
await db.insert(orders).values(ordersToInsert)

console.log(chalk.yellow('✔ Created orders'))

process.exit()
