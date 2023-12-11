import { createId } from "@paralleldrive/cuid2";
import { pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["admin", "deliveryman"]);

export const user = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 11 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: role("role").default("deliveryman").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});
