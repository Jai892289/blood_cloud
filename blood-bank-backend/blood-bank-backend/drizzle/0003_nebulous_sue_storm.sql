ALTER TABLE "billings" DROP CONSTRAINT "billings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "billings" ALTER COLUMN "user_id" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "billings" ADD CONSTRAINT "billings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;