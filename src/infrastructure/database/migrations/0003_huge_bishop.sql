ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "surname";
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");