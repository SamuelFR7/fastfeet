import { createId } from "@paralleldrive/cuid2";
import { varchar, pgTable } from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  username: varchar("username", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
});
