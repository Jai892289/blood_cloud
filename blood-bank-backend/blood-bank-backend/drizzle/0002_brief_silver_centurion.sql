ALTER TABLE "billings" DROP CONSTRAINT "billings_blood_category_id_blood_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "patient_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "sex" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "age" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "mobile_number" varchar(15);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "father_husband_name" varchar(100);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "hospital_name" varchar(150);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "referred_by_dr" varchar(150);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "crn" varchar(50);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "ward" varchar(50);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "bed" varchar(50);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "ipd_no" varchar(50);--> statement-breakpoint
ALTER TABLE "billings" ADD COLUMN "blood_component_details" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "date_time";--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "blood_category_id";--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "rate_per_unit";--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "billings" DROP COLUMN "contact_no";