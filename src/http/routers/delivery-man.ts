import Elysia, { t } from "elysia";
import { db } from "@/db";
import { user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import bearer from "@elysiajs/bearer";
import { authentication } from "../authentication";

export const deliveryRouter = new Elysia().use(authentication).use(bearer());

deliveryRouter.post(
  "api/v1/deliveryman/",
  async ({ getIsAdmin, body, set }) => {
    await getIsAdmin();

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

deliveryRouter.get(
  "/api/v1/deliveryman/:id",
  async ({ getIsAdmin, set, params: { id } }) => {
    await getIsAdmin();

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

deliveryRouter.get("/api/v1/deliveryman", async ({ getIsAdmin }) => {
  await getIsAdmin();

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
deliveryRouter.patch(
  "/api/v1/deliveryman/:id",
  async ({ getIsAdmin, set, params: { id }, body }) => {
    await getIsAdmin();

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
deliveryRouter.delete(
  "/api/v1/deliveryman/:id",
  async ({ getIsAdmin, set, params: { id } }) => {
    await getIsAdmin();

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
