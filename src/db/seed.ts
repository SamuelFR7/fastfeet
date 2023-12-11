import { user } from './schema'
import { faker } from '@faker-js/faker'
import { db } from './connection'
import chalk from 'chalk'
import { hashSync } from 'bcryptjs'

/**
 * Reset database
 */
await db.delete(user)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create deliverymen and a admin
 */
await db.insert(user).values([
  {
    name: faker.person.fullName().toUpperCase(),
    role: 'deliveryman',
    cpf: faker.string.numeric('###########'),
    password: hashSync(faker.string.numeric('######'), 8),
  },
  {
    name: faker.person.fullName().toUpperCase(),
    role: 'deliveryman',
    cpf: faker.string.numeric('###########'),
    password: hashSync(faker.string.numeric('######'), 8),
  },
  {
    name: 'SAMUEL REZENDE',
    role: 'admin',
    cpf: '12312312312',
    password: hashSync('123456', 8),
  },
])

console.log(chalk.yellow('✔ Created delivery men'))

process.exit()
