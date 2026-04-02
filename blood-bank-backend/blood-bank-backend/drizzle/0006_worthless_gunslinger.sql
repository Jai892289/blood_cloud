ALTER TABLE "blood_categories" ADD COLUMN "cross_match" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "blood_categories" DROP COLUMN "blood_group";