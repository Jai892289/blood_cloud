ALTER TABLE "billings" ADD COLUMN "reference_id" varchar(50);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "status" varchar(20) DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "billings" ADD CONSTRAINT "billings_reference_id_unique" UNIQUE("reference_id");