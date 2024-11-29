ALTER TABLE "passwordResetTable" RENAME COLUMN "user_id" TO "email";
ALTER TABLE "passwordResetTable" DROP CONSTRAINT "passwordResetTable_user_id_unique";
ALTER TABLE "passwordResetTable" DROP CONSTRAINT "passwordResetTable_user_id_users_id_fk";

DO $$ BEGIN
 ALTER TABLE "passwordResetTable" ADD CONSTRAINT "passwordResetTable_email_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "passwordResetTable" ADD CONSTRAINT "passwordResetTable_email_unique" UNIQUE("email");