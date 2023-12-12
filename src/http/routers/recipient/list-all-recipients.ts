import { db } from '@/db/connection'
import { Recipient, recipients } from '@/db/schema'
import { authentication } from '@/http/authentication'
import { asc, count, desc, like } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

export const listAllRecipients = new Elysia().use(authentication).get(
  '/',
  async ({ query }) => {
    const { page, limit, sort, search } = query

    const numericPage = parseInt(page) > 0 ? parseInt(page) : 1
    const numericLimit = parseInt(limit) > 0 ? parseInt(limit) : 10

    const offset = (numericPage - 1) * numericLimit

    const [column, order] =
      typeof sort === 'string'
        ? (sort.split('.') as [
            keyof Recipient | undefined,
            'asc' | 'desc' | undefined,
          ])
        : [undefined, undefined]

    const recipientsQuery = await db
      .select()
      .from(recipients)
      .offset(offset)
      .limit(numericLimit)
      .orderBy(
        column && column in recipients
          ? order === 'asc'
            ? asc(recipients[column])
            : desc(recipients[column])
          : asc(recipients.id)
      )
      .where(
        typeof search === 'string'
          ? like(recipients.name, `%${search.toUpperCase()}%`)
          : undefined
      )

    const totalCount = await db
      .select({ count: count(recipients.id) })
      .from(recipients)

    return new Response(
      JSON.stringify({
        recipients: recipientsQuery,
        totalCount,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  },
  {
    beforeHandle: async ({ set, getIsAdmin }) => {
      const isAdmin = await getIsAdmin()

      if (!isAdmin) {
        set.status = 401
        return 'Unauthorized'
      }
    },
    query: t.Object({
      page: t.String(),
      limit: t.String(),
      sort: t.Optional(t.String()),
      search: t.Optional(t.String()),
    }),
  }
)
