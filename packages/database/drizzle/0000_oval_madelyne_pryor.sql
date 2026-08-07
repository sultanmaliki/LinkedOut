CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."attachment_type" AS ENUM('IMAGE', 'VIDEO', 'PDF');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('STARTUP', 'PRIVATE', 'PUBLIC', 'GOVERNMENT', 'NON_PROFIT', 'EDUCATIONAL');--> statement-breakpoint
CREATE TYPE "public"."contact_method_type" AS ENUM('EMAIL', 'PHONE', 'LINKEDIN', 'PORTFOLIO');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('ACTIVE', 'CLOSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."moderation_reason" AS ENUM('SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'FAKE_REVIEW', 'MISLEADING_JOB', 'IMPERSONATION', 'POLICY_VIOLATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."notice_period" AS ENUM('IMMEDIATE', '7_DAYS', '15_DAYS', '30_DAYS', '45_DAYS', '60_DAYS', '90_DAYS', 'NEGOTIABLE');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."post_visibility" AS ENUM('VISIBLE_NOW', 'SCHEDULED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."review_recommendation" AS ENUM('YES', 'NO', 'NEUTRAL');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('PROFESSIONAL', 'COMPANY_ADMIN', 'MODERATOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('ONSITE', 'HYBRID', 'REMOTE');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'PROFESSIONAL' NOT NULL,
	"status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"headline" text,
	"bio" text,
	"profile_photo_url" text,
	"banner_photo_url" text,
	"current_location" text,
	"personal_website" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "employment_expectations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_profile_id" uuid NOT NULL,
	"desired_job_title" text NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"work_mode" "work_mode" NOT NULL,
	"expected_salary_min" bigint,
	"expected_salary_max" bigint,
	"currency" char(3) DEFAULT 'INR' NOT NULL,
	"notice_period" "notice_period" DEFAULT 'NEGOTIABLE' NOT NULL,
	"open_to_relocation" boolean DEFAULT false NOT NULL,
	"actively_looking" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employment_expectations_professional_profile_id_unique" UNIQUE("professional_profile_id"),
	CONSTRAINT "salary_range_check" CHECK (
        "employment_expectations"."expected_salary_min" IS NULL
        OR "employment_expectations"."expected_salary_max" IS NULL
        OR "employment_expectations"."expected_salary_min" <= "employment_expectations"."expected_salary_max"
      )
);
--> statement-breakpoint
CREATE TABLE "employment_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_profile_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"job_title" text NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"work_mode" "work_mode" NOT NULL,
	"location" text,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"currently_working" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_skills" (
	"professional_profile_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency" integer,
	"years_of_experience" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_skills_professional_profile_id_skill_id_pk" PRIMARY KEY("professional_profile_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "portfolio_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employment_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employment_history_id" uuid NOT NULL,
	"company_email" text,
	"employee_id" text,
	"id_card_url" text,
	"verification_status" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employment_verifications_employment_history_id_unique" UNIQUE("employment_history_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" text NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"company_type" "company_type" NOT NULL,
	"website" text,
	"logo_url" text,
	"banner_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_status" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"description" text,
	"industry" text,
	"founded_year" integer,
	"employee_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "company_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"location_name" text NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"city" text,
	"address" text,
	"postal_code" text,
	"is_headquarters" boolean DEFAULT false NOT NULL,
	"is_remote" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_admins" (
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_admins_company_id_user_id_pk" PRIMARY KEY("company_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "company_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"business_registration_number" text,
	"tax_identification_number" text,
	"verification_document_url" text,
	"verification_status" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_verifications_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "benefits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "benefits_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "company_benefits" (
	"company_id" uuid NOT NULL,
	"benefit_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_benefits_company_id_benefit_id_pk" PRIMARY KEY("company_id","benefit_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_profile_id" uuid,
	"company_id" uuid,
	"content" text,
	"visibility" "post_visibility" DEFAULT 'VISIBLE_NOW' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"delete_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"archived_before" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid,
	"type" "attachment_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"thumbnail_url" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"professional_profile_id" uuid,
	"company_id" uuid,
	"parent_comment_id" uuid,
	"content" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"post_id" uuid NOT NULL,
	"professional_profile_id" uuid,
	"company_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_post_id_professional_profile_id_company_id_pk" PRIMARY KEY("post_id","professional_profile_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"company_location_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"work_mode" "work_mode" NOT NULL,
	"openings" integer DEFAULT 1 NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"status" "job_status" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"professional_profile_id" uuid NOT NULL,
	"message" text,
	"status" "opportunity_status" DEFAULT 'PENDING' NOT NULL,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_snapshots_opportunity_id_unique" UNIQUE("opportunity_id")
);
--> statement-breakpoint
CREATE TABLE "professional_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"accepted" boolean NOT NULL,
	"message" varchar(250),
	"responded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_responses_opportunity_id_unique" UNIQUE("opportunity_id")
);
--> statement-breakpoint
CREATE TABLE "contact_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_response_id" uuid NOT NULL,
	"type" "contact_method_type" NOT NULL,
	"value" text NOT NULL,
	"shared_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_methods_professional_response_id_unique" UNIQUE("professional_response_id")
);
--> statement-breakpoint
CREATE TABLE "hiring_pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"notes" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employment_history_id" uuid NOT NULL,
	"title" text NOT NULL,
	"review" text NOT NULL,
	"anonymous" boolean DEFAULT true NOT NULL,
	"recommended" boolean DEFAULT true NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_edited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_employment_history_id_unique" UNIQUE("employment_history_id")
);
--> statement-breakpoint
CREATE TABLE "review_ratings" (
	"review_id" uuid NOT NULL,
	"category" text NOT NULL,
	"score" integer NOT NULL,
	CONSTRAINT "review_ratings_review_id_category_pk" PRIMARY KEY("review_id","category")
);
--> statement-breakpoint
CREATE TABLE "company_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"reply" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"replied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_replies_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "review_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_snapshots_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "professional_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_snapshots_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "moderation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" "moderation_reason" NOT NULL,
	"description" text,
	"status" "moderation_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderation_case_id" uuid NOT NULL,
	"moderator_id" uuid,
	"action" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"score_impact" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_expectations" ADD CONSTRAINT "employment_expectations_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_histories" ADD CONSTRAINT "employment_histories_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_skills" ADD CONSTRAINT "professional_skills_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_skills" ADD CONSTRAINT "professional_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_links" ADD CONSTRAINT "portfolio_links_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_verifications" ADD CONSTRAINT "employment_verifications_employment_history_id_employment_histories_id_fk" FOREIGN KEY ("employment_history_id") REFERENCES "public"."employment_histories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_locations" ADD CONSTRAINT "company_locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_admins" ADD CONSTRAINT "company_admins_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_admins" ADD CONSTRAINT "company_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_verifications" ADD CONSTRAINT "company_verifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_benefits" ADD CONSTRAINT "company_benefits_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_benefits" ADD CONSTRAINT "company_benefits_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_location_id_company_locations_id_fk" FOREIGN KEY ("company_location_id") REFERENCES "public"."company_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_professional_profile_id_professional_profiles_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_snapshots" ADD CONSTRAINT "opportunity_snapshots_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_responses" ADD CONSTRAINT "professional_responses_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_methods" ADD CONSTRAINT "contact_methods_professional_response_id_professional_responses_id_fk" FOREIGN KEY ("professional_response_id") REFERENCES "public"."professional_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hiring_pipelines" ADD CONSTRAINT "hiring_pipelines_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_employment_history_id_employment_histories_id_fk" FOREIGN KEY ("employment_history_id") REFERENCES "public"."employment_histories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_ratings" ADD CONSTRAINT "review_ratings_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_replies" ADD CONSTRAINT "company_replies_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_snapshots" ADD CONSTRAINT "review_snapshots_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_snapshots" ADD CONSTRAINT "professional_snapshots_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderation_case_id_moderation_cases_id_fk" FOREIGN KEY ("moderation_case_id") REFERENCES "public"."moderation_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_flags" ADD CONSTRAINT "trust_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;