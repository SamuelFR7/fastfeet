import { createId } from "@paralleldrive/cuid2";
import { varchar, pgTable, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["admin", "deliveryman"]);

export const user = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: role("role").default("deliveryman"),
});

export const session = pgTable("sessions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 255 }).references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  expireAt: timestamp("expire_at"),
});
