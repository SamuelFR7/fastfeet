import { Elysia, t } from "elysia";
import { db } from "./db";
import { session, user } from "./db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import dayjs from "dayjs";

const app = new Elysia();

app.post(
  "/auth/session",
  async ({ body }) => {
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

    const todayPlusOne = dayjs().add(1, "day").toDate();

    const newSessions = await db
      .insert(session)
      .values({
        userId: userExists.id,
        expireAt: todayPlusOne,
      })
      .returning({
        id: session.id,
      });

    const sessionCreated = newSessions[0];

    return new Response(JSON.stringify(sessionCreated), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
