CREATE TABLE "hospitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_name" varchar(150) NOT NULL,
	"commission" numeric(5, 2) DEFAULT '0',
	"serial_no" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
