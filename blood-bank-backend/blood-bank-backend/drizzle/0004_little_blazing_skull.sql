ALTER TABLE "billings" ALTER COLUMN "age_years" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ALTER COLUMN "age_months" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ALTER COLUMN "age_days" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ALTER COLUMN "age" DROP NOT NULL;