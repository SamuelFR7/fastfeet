import { Elysia, t } from "elysia";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET!, exp: "7d" }))
  .use(swagger());

app.post(
  "/auth/session",
  async ({ body, jwt }) => {
    const userExistsQuery = await db
      .select()
      .from(user)
      .where(eq(user.username, body.username));

    const userExists = userExistsQuery[0];

    if (!userExists) {
      return {
        status: 401,
        body: {
          message: "Invalid username or password",
        },
      };
    }

    const passwordMatches = compare(body.password, userExists.password);

    if (!passwordMatches) {
      return {
        status: 401,
        body: {
          message: "Invalid username or password",
        },
      };
    }

    const token = await jwt.sign({
      sub: userExists.id,
    });

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
    );
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
  }
);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
