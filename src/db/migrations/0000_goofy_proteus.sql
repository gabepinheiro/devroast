CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('disaster', 'needs_serious_help', 'mediocre', 'decent', 'impressive', 'flawless');--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_id" uuid NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" boolean DEFAULT true NOT NULL,
	"score" real NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_comment" text NOT NULL,
	"improved_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roasts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_roast_id_roasts_id_fk" FOREIGN KEY ("roast_id") REFERENCES "public"."roasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issues_roast_id_idx" ON "issues" USING btree ("roast_id");--> statement-breakpoint
CREATE INDEX "roasts_score_idx" ON "roasts" USING btree ("score");