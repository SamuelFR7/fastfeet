import { Elysia, t } from "elysia";
import { db } from "./db";
import { user } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
      schema: t.Object({ role: t.String() }),
    })
  )
  .use(bearer())
  .use(swagger());

app.post(
  "api/v1/auth/session",
  async ({ body, jwt }) => {
    const userExistsQuery = await db
      .select()
      .from(user)
      .where(eq(user.cpf, body.cpf));

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
      role: userExists.role,
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
      cpf: t.String(),
      password: t.String(),
    }),
  }
);

app.post(
  "api/v1/deliveryman/",
  async ({ body, jwt, set, bearer }) => {
    if (!bearer) {
      return {
        status: 401,
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    const verify = await jwt.verify(bearer);

    if (verify === false) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    if (verify.role !== "admin") {
      set.status = 401;

      return {
        body: {
          message: "You don't have permission to do this",
        },
      };
    }

    const userAlreadyExists = await db
      .select()
      .from(user)
      .where(eq(user.cpf, body.cpf));

    if (userAlreadyExists[0]) {
      set.status = 409;

      return {
        body: {
          message: "User already exists",
        },
      };
    }

    const hashedPassword = await hash(body.password, 8);

    await db.insert(user).values({
      cpf: body.cpf,
      name: body.name,
      password: hashedPassword,
      role: "deliveryman",
    });

    return {
      status: 201,
      body: {
        message: "User created successfully",
      },
    };
  },
  {
    body: t.Object({
      name: t.String(),
      cpf: t.String(),
      password: t.String(),
    }),
    headers: t.Object({
      authorization: t.String(),
    }),
  }
);
app.get(
  "/api/v1/deliveryman/:id",
  async ({ jwt, bearer, set, params: { id } }) => {
    if (!bearer) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    const verify = await jwt.verify(bearer);

    if (verify === false) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    if (verify.role !== "admin") {
      set.status = 401;

      return {
        body: {
          message: "You don't have permission to do this",
        },
      };
    }

    const deliverymanQuery = await db
      .select({
        name: user.name,
        cpf: user.cpf,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(eq(user.id, id), eq(user.role, "deliveryman")));

    const deliveryman = deliverymanQuery[0];

    if (!deliveryman) {
      set.status = 404;

      return {
        body: {
          message: "Deliveryman not found",
        },
      };
    }

    return new Response(JSON.stringify(deliveryman), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
);
app.get("/api/v1/deliveryman", async ({ jwt, bearer, set }) => {
  if (!bearer) {
    set.status = 401;
    return {
      body: {
        message: "You must be logged in to do this",
      },
    };
  }

  const verify = await jwt.verify(bearer);

  if (verify === false) {
    set.status = 401;
    return {
      body: {
        message: "You must be logged in to do this",
      },
    };
  }

  if (verify.role !== "admin") {
    set.status = 401;

    return {
      body: {
        message: "You don't have permission to do this",
      },
    };
  }

  const deliverymenQuery = await db
    .select({
      name: user.name,
      cpf: user.cpf,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.role, "deliveryman"));

  const deliverymen = deliverymenQuery;

  return new Response(JSON.stringify(deliverymen), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});
app.patch(
  "/api/v1/deliveryman/:id",
  async ({ jwt, bearer, set, params: { id }, body }) => {
    if (!bearer) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    const verify = await jwt.verify(bearer);

    if (verify === false) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    if (verify.role !== "admin") {
      set.status = 401;

      return {
        body: {
          message: "You don't have permission to do this",
        },
      };
    }

    const deliverymanQuery = await db
      .select({
        name: user.name,
        cpf: user.cpf,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(eq(user.id, id), eq(user.role, "deliveryman")));

    const deliveryman = deliverymanQuery[0];

    if (!deliveryman) {
      set.status = 404;

      return {
        body: {
          message: "Deliveryman not found",
        },
      };
    }

    await db
      .update(user)
      .set({
        name: body.name,
        cpf: body.cpf,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    return {
      status: 200,
      body: {
        message: "Deliveryman updated successfully",
      },
    };
  },
  {
    body: t.Object({
      name: t.String(),
      cpf: t.String(),
    }),
  }
);
app.delete(
  "/api/v1/deliveryman/:id",
  async ({ jwt, bearer, set, params: { id } }) => {
    if (!bearer) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    const verify = await jwt.verify(bearer);

    if (verify === false) {
      set.status = 401;
      return {
        body: {
          message: "You must be logged in to do this",
        },
      };
    }

    if (verify.role !== "admin") {
      set.status = 401;

      return {
        body: {
          message: "You don't have permission to do this",
        },
      };
    }

    const deliverymanQuery = await db
      .select({
        name: user.name,
        cpf: user.cpf,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(eq(user.id, id), eq(user.role, "deliveryman")));

    const deliveryman = deliverymanQuery[0];

    if (!deliveryman) {
      set.status = 404;

      return {
        body: {
          message: "Deliveryman not found",
        },
      };
    }

    await db.delete(user).where(eq(user.id, id));

    return {
      status: 200,
      body: {
        message: "Deliveryman deleted successfully",
      },
    };
  }
);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
