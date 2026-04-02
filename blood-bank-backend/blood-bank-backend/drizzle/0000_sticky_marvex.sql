CREATE TABLE "billings" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_no" varchar(50) NOT NULL,
	"date_time" timestamp DEFAULT now(),
	"blood_category_id" integer,
	"quantity" integer NOT NULL,
	"rate_per_unit" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"customer_name" varchar(100),
	"contact_no" varchar(15),
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"blood_group" varchar(10) NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gst_percent" (
	"id" serial PRIMARY KEY NOT NULL,
	"percent" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"counter_location" varchar(100),
	"status" boolean DEFAULT true,
	"role" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "billings" ADD CONSTRAINT "billings_blood_category_id_blood_categories_id_fk" FOREIGN KEY ("blood_category_id") REFERENCES "public"."blood_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billings" ADD CONSTRAINT "billings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;