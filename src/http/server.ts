import { Elysia, t } from "elysia"
import { swagger } from "@elysiajs/swagger"
import { bearer } from "@elysiajs/bearer"
import { deliveryRouter } from "./routers/delivery-man"
import { authRouter } from "./routers/auth"
import { env } from "@/env"

export const app = new Elysia()
  .use(bearer())
  .use(swagger())
  .use(authRouter)
  .use(deliveryRouter)

app.listen(env.PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
