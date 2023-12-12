import Elysia from 'elysia'
import { signIn } from './sign-in'
import { changePassword } from './change-password'

export const authRouter = new Elysia({ prefix: '/auth' })
  .use(signIn)
  .use(changePassword)
