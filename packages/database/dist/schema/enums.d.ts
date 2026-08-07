export declare const accountStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'BANNED']
>;
export declare const userRoleEnum: import('drizzle-orm/pg-core').PgEnum<
  ['PROFESSIONAL', 'COMPANY_ADMIN', 'MODERATOR', 'ADMIN']
>;
export declare const employmentTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP']
>;
export declare const workModeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['ONSITE', 'HYBRID', 'REMOTE']
>;
export declare const verificationStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['PENDING', 'VERIFIED', 'REJECTED']
>;
export declare const companyTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['STARTUP', 'PRIVATE', 'PUBLIC', 'GOVERNMENT', 'NON_PROFIT', 'EDUCATIONAL']
>;
export declare const postVisibilityEnum: import('drizzle-orm/pg-core').PgEnum<
  ['VISIBLE_NOW', 'SCHEDULED', 'ARCHIVED']
>;
export declare const attachmentTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['IMAGE', 'VIDEO', 'PDF']
>;
export declare const jobStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['ACTIVE', 'CLOSED', 'ARCHIVED']
>;
export declare const opportunityStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN']
>;
export declare const contactMethodTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['EMAIL', 'PHONE', 'LINKEDIN', 'PORTFOLIO']
>;
export declare const reviewRecommendationEnum: import('drizzle-orm/pg-core').PgEnum<
  ['YES', 'NO', 'NEUTRAL']
>;
export declare const moderationStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED']
>;
export declare const noticePeriodEnum: import('drizzle-orm/pg-core').PgEnum<
  ['IMMEDIATE', '7_DAYS', '15_DAYS', '30_DAYS', '45_DAYS', '60_DAYS', '90_DAYS', 'NEGOTIABLE']
>;
export declare const moderationReasonEnum: import('drizzle-orm/pg-core').PgEnum<
  [
    'SPAM',
    'HARASSMENT',
    'FAKE_PROFILE',
    'FAKE_REVIEW',
    'MISLEADING_JOB',
    'IMPERSONATION',
    'POLICY_VIOLATION',
    'OTHER',
  ]
>;
