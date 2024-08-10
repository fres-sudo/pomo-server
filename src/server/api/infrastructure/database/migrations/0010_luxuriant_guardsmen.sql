CREATE TABLE IF NOT EXISTS "contributors" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"userId" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "oAuths" (
	"providerId" text NOT NULL,
	"providerUserId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "oAuths_providerId_providerUserId_pk" PRIMARY KEY("providerId","providerUserId")
);

CREATE TABLE IF NOT EXISTS "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"startDate" timestamp DEFAULT now(),
	"endDate" timestamp NOT NULL,
	"imageCover" text,
	"completedAt" timestamp,
	"user_id" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pomodoro" integer DEFAULT 1 NOT NULL,
	"pomodoroCompleted" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"projectId" text,
	"user_id" text NOT NULL
);

DROP TABLE "addresses";
DROP TABLE "appointments";
DROP TABLE "cities";
DROP TABLE "countries";
DROP TABLE "doctors";
DROP TABLE "emergencyContatcts";
DROP TABLE "login_requests";
DROP TABLE "medicalHistories";
DROP TABLE "patients";
DROP TABLE "receptionists";
ALTER TABLE "users" DROP CONSTRAINT "users_address_addresses_id_fk";

DO $$ BEGIN
 ALTER TABLE "contributors" ADD CONSTRAINT "contributors_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "contributors" ADD CONSTRAINT "contributors_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "oAuths" ADD CONSTRAINT "oAuths_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users" DROP COLUMN IF EXISTS "gender";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "birthdate";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address";
ALTER TABLE "users" DROP COLUMN IF EXISTS "phoneNumber";