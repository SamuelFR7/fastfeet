import Elysia, { t } from "elysia"
import { user } from "@/db/schema/user"
import { db } from "@/db/connection"
import { eq } from "drizzle-orm"
import { compare } from "bcryptjs"
import { authentication } from "../authentication"

export const authRouter = new Elysia().use(authentication)

authRouter.post(
  "api/v1/auth/session",
  async ({ body, signInUser }) => {
    const userExistsQuery = await db
      .select()
      .from(user)
      .where(eq(user.cpf, body.cpf))

    const userExists = userExistsQuery[0]

    if (!userExists) {
      return {
        status: 401,
        body: {
          message: "Invalid username or password",
        },
      }
    }

    const passwordMatches = compare(body.password, userExists.password)

    if (!passwordMatches) {
      return {
        status: 401,
        body: {
          message: "Invalid username or password",
        },
      }
    }

    const token = await signInUser({
      sub: userExists.id,
      admin: userExists.role === "admin",
    })

    return new Response(
      JSON.stringify({
        token,
        user: {
          role: userExists.role,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  },
  {
    body: t.Object({
      cpf: t.String(),
      password: t.String(),
    }),
  }
)
