DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('admin', 'deliveryman');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'deliveryman',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_cpf_unique" UNIQUE("cpf")
);
