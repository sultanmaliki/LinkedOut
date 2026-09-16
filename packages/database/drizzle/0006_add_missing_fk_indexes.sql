CREATE INDEX "posts_professional_profile_id_idx" ON "posts" USING btree ("professional_profile_id");--> statement-breakpoint
CREATE INDEX "posts_company_id_idx" ON "posts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "opportunities_job_id_idx" ON "opportunities" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "opportunities_professional_profile_id_idx" ON "opportunities" USING btree ("professional_profile_id");--> statement-breakpoint
CREATE INDEX "hiring_pipelines_opportunity_id_idx" ON "hiring_pipelines" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "reviews_company_id_idx" ON "reviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "moderation_cases_status_idx" ON "moderation_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "moderation_cases_target_idx" ON "moderation_cases" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");