ALTER TABLE "billings" ADD COLUMN "is_cancelled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "cancel_remark" text;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "cancelled_at" timestamp;