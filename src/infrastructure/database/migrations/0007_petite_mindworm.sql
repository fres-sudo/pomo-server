CREATE TABLE IF NOT EXISTS "oAuths" (
	"providerId" text NOT NULL,
	"providerUserId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "oAuths_providerId_providerUserId_pk" PRIMARY KEY("providerId","providerUserId")
);

ALTER TABLE "tasks" ADD COLUMN "highPriority" boolean DEFAULT false NOT NULL;
DO $$ BEGIN
 ALTER TABLE "oAuths" ADD CONSTRAINT "oAuths_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
