CREATE TYPE "public"."pipeline_stage" AS ENUM('SENT', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'INTERVIEW_SCHEDULED', 'REVIEWING', 'OFFER_RELEASED', 'OFFER_ACCEPTED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "hiring_pipelines" ADD COLUMN "stage_new" "public"."pipeline_stage";--> statement-breakpoint
UPDATE "hiring_pipelines" SET "stage_new" = CASE "stage"
  WHEN 'OPPORTUNITY_SENT' THEN 'SENT'
  WHEN 'OPPORTUNITY_ACCEPTED' THEN 'ACCEPTED'
  WHEN 'OPPORTUNITY_DECLINED' THEN 'DECLINED'
  WHEN 'WITHDRAWN' THEN 'WITHDRAWN'
  WHEN 'SCREENING' THEN 'INTERVIEW_SCHEDULED'
  WHEN 'TECHNICAL' THEN 'INTERVIEW_SCHEDULED'
  WHEN 'HR' THEN 'INTERVIEW_SCHEDULED'
  WHEN 'OFFER' THEN 'OFFER_RELEASED'
  WHEN 'HIRED' THEN 'OFFER_ACCEPTED'
  WHEN 'REJECTED' THEN 'REJECTED'
  ELSE NULL
END::"public"."pipeline_stage";--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "hiring_pipelines" WHERE "stage_new" IS NULL) THEN
    RAISE EXCEPTION 'pipeline_v2_ghosting_prevention: unmapped hiring_pipelines.stage value(s) found, aborting migration';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "hiring_pipelines" DROP COLUMN "stage";--> statement-breakpoint
ALTER TABLE "hiring_pipelines" RENAME COLUMN "stage_new" TO "stage";--> statement-breakpoint
ALTER TABLE "hiring_pipelines" ALTER COLUMN "stage" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "default_response_window_days" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "default_offer_window_days" integer;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "response_window_days" integer;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "manually_flagged_unresponsive_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hiring_pipelines" ADD COLUMN "scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hiring_pipelines" ADD COLUMN "window_days" integer;
