ALTER TABLE "tasks" DROP CONSTRAINT "tasks_projectId_projects_id_fk";

DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
