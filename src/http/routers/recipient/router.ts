import Elysia from 'elysia'
import { createRecipient } from './create-recipient'
import { getUniqueRecipient } from './get-unique-recipient'
import { listAllRecipients } from './list-all-recipients'
import { updateRecipient } from './update-recipient'
import { deleteRecipient } from './delete-recipient'

export const recipientRouter = new Elysia({ prefix: '/recipient' })
  .use(createRecipient)
  .use(getUniqueRecipient)
  .use(listAllRecipients)
  .use(updateRecipient)
  .use(deleteRecipient)
