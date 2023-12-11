import {
  AdressInsert,
  RecipientInsert,
  adresses,
  recipients,
  user,
} from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'
import { hashSync } from 'bcryptjs'
import { InsertOrder, orders } from './schema/order'

/**
 * Reset database
 */
await db.delete(recipients)
await db.delete(orders)
await db.delete(adresses)
await db.delete(user)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create adresses
 */
function generateAdresses() {
  const adresses: AdressInsert[] = []

  for (let i = 0; i < 100; i++) {
    adresses.push({
      city: faker.location.city().toUpperCase(),
      state: faker.location.state().toUpperCase(),
      street: faker.location.street().toUpperCase(),
      number: faker.location.buildingNumber(),
      zipCode: faker.location.zipCode(),
    })
  }

  return adresses
}
const adressesToInsert = generateAdresses()
const adressesInserted = await db
  .insert(adresses)
  .values(adressesToInsert)
  .returning()

console.log(chalk.yellow('✔ Created adresses'))

/**
 * Create recipients
 */
function generateRecipients() {
  const recipients: RecipientInsert[] = []

  for (let i = 0; i < 100; i++) {
    recipients.push({
      name: faker.person.fullName().toUpperCase(),
      cpf: faker.string.numeric('###########'),
      phone: faker.string.numeric('###########'),
      adressId: faker.helpers.arrayElement(adressesInserted).id,
    })
  }

  return recipients
}
const recipientsToInsert = generateRecipients()
const recipientsInserted = await db
  .insert(recipients)
  .values(recipientsToInsert)
  .returning()

console.log(chalk.yellow('✔ Created recipients'))

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

/**
 * Create orders
 */
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
      recipientId: faker.helpers.arrayElement(recipientsInserted).id,
    })
  }

  return orders
}

const ordersToInsert = generateOrders()
await db.insert(orders).values(ordersToInsert)

console.log(chalk.yellow('✔ Created orders'))

process.exit()
