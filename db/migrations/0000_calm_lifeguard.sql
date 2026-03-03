CREATE TABLE "resume_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"layouts" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"active_template_id" text DEFAULT 'standard' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_contents" ADD CONSTRAINT "resume_contents_id_resumes_id_fk" FOREIGN KEY ("id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resumes_owner_id_idx" ON "resumes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "resumes_updated_at_idx" ON "resumes" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");