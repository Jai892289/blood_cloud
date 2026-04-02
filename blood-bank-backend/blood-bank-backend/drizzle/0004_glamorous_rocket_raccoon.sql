ALTER TABLE "billings" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "payment_method" varchar(50) DEFAULT 'Cash';