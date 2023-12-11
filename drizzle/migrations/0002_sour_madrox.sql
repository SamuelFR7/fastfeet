DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'available', 'picked_up', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"delivery_man_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_man_id_users_id_fk" FOREIGN KEY ("delivery_man_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
