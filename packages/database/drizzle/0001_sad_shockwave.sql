ALTER TABLE "likes" DROP CONSTRAINT "likes_post_id_professional_profile_id_company_id_pk";--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "professional_profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "likes_post_professional_company_idx" ON "likes" USING btree ("post_id","professional_profile_id","company_id");