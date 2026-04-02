CREATE TABLE "blood_component_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_name" varchar(100) NOT NULL,
	"description" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_group_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(10) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blood_group_master_group_name_unique" UNIQUE("group_name")
);
--> statement-breakpoint
CREATE TABLE "counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"counter_name" varchar(100) NOT NULL,
	"location" varchar(150) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
