CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"password" varchar(255),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
