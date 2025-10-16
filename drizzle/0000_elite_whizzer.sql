CREATE TYPE "public"."club_enum" AS ENUM('sdc', 'gdg');--> statement-breakpoint
CREATE TABLE "SDCxGDG_submission" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "SDCxGDG_submission_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(50) NOT NULL,
	"lastName" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phoneNumber" varchar(15) NOT NULL,
	"course" varchar(100) NOT NULL,
	"batch" varchar(20) NOT NULL,
	"github" varchar(255) NOT NULL,
	"linkedin" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"club" "club_enum" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "SDCxGDG_submission_email_unique" UNIQUE("email")
);
