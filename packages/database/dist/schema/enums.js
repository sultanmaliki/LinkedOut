import { pgEnum } from 'drizzle-orm/pg-core';
/* ============================
   User
============================ */
export const accountStatusEnum = pgEnum('account_status', [
  'ACTIVE',
  'DEACTIVATED',
  'SUSPENDED',
  'BANNED',
]);
export const userRoleEnum = pgEnum('user_role', [
  'PROFESSIONAL',
  'COMPANY_ADMIN',
  'MODERATOR',
  'ADMIN',
]);
/* ============================
   Professional
============================ */
export const employmentTypeEnum = pgEnum('employment_type', [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
  'APPRENTICESHIP',
]);
export const workModeEnum = pgEnum('work_mode', ['ONSITE', 'HYBRID', 'REMOTE']);
export const verificationStatusEnum = pgEnum('verification_status', [
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);
/* ============================
   Company
============================ */
export const companyTypeEnum = pgEnum('company_type', [
  'STARTUP',
  'PRIVATE',
  'PUBLIC',
  'GOVERNMENT',
  'NON_PROFIT',
  'EDUCATIONAL',
]);
/* ============================
   Posts
============================ */
export const postVisibilityEnum = pgEnum('post_visibility', [
  'VISIBLE_NOW',
  'SCHEDULED',
  'ARCHIVED',
]);
export const attachmentTypeEnum = pgEnum('attachment_type', ['IMAGE', 'VIDEO', 'PDF']);
/* ============================
   Hiring
============================ */
export const jobStatusEnum = pgEnum('job_status', ['ACTIVE', 'CLOSED', 'ARCHIVED']);
export const opportunityStatusEnum = pgEnum('opportunity_status', [
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'WITHDRAWN',
]);
export const contactMethodTypeEnum = pgEnum('contact_method_type', [
  'EMAIL',
  'PHONE',
  'LINKEDIN',
  'PORTFOLIO',
]);
/* ============================
   Reviews
============================ */
export const reviewRecommendationEnum = pgEnum('review_recommendation', ['YES', 'NO', 'NEUTRAL']);
/* ============================
   Moderation
============================ */
export const moderationStatusEnum = pgEnum('moderation_status', [
  'OPEN',
  'UNDER_REVIEW',
  'ACTION_TAKEN',
  'DISMISSED',
]);
export const noticePeriodEnum = pgEnum('notice_period', [
  'IMMEDIATE',
  '7_DAYS',
  '15_DAYS',
  '30_DAYS',
  '45_DAYS',
  '60_DAYS',
  '90_DAYS',
  'NEGOTIABLE',
]);
export const moderationReasonEnum = pgEnum('moderation_reason', [
  'SPAM',
  'HARASSMENT',
  'FAKE_PROFILE',
  'FAKE_REVIEW',
  'MISLEADING_JOB',
  'IMPERSONATION',
  'POLICY_VIOLATION',
  'OTHER',
]);
