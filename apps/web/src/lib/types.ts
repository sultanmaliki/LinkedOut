export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  bannerPhotoUrl: string | null;
  currentLocation: string | null;
  personalWebsite: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalSkill {
  skillId: string;
  name: string;
  proficiency: number | null;
  yearsOfExperience: number | null;
}

export interface PortfolioLink {
  id: string;
  professionalProfileId: string;
  title: string;
  url: string;
  createdAt: string;
}

export type NoticePeriod =
  'IMMEDIATE' | '7_DAYS' | '15_DAYS' | '30_DAYS' | '45_DAYS' | '60_DAYS' | '90_DAYS' | 'NEGOTIABLE';

export interface EmploymentExpectation {
  id: string;
  professionalProfileId: string;
  desiredJobTitle: string;
  employmentType: string;
  workMode: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  currency: string;
  noticePeriod: NoticePeriod;
  openToRelocation: boolean;
  activelyLooking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmploymentHistory {
  id: string;
  professionalProfileId: string;
  companyName: string;
  jobTitle: string;
  employmentType: string;
  workMode: string;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  currentlyWorking: boolean;
}

export interface EmploymentVerification {
  id: string;
  employmentHistoryId: string;
  companyEmail: string | null;
  employeeId: string | null;
  idCardUrl: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export interface PendingEmploymentVerification extends EmploymentVerification {
  professionalProfileId: string;
  professionalFullName: string;
  companyName: string;
  jobTitle: string;
}

export interface CompanyVerification {
  id: string;
  companyId: string;
  businessRegistrationNumber: string | null;
  taxIdentificationNumber: string | null;
  verificationDocumentUrl: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export interface PendingCompanyVerification extends CompanyVerification {
  companyDisplayName: string;
  companyLegalName: string;
}

export interface Company {
  id: string;
  legalName: string;
  displayName: string;
  slug: string;
  companyType: string;
  website: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  verificationStatus: string;
  description: string | null;
  industry: string | null;
  foundedYear: number | null;
  employeeCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyLocation {
  id: string;
  companyId: string;
  locationName: string;
  country: string;
  state: string | null;
  city: string | null;
  isHeadquarters: boolean;
  isRemote: boolean;
}

export interface CompanyBenefit {
  id: string;
  name: string;
}

export interface ReviewRating {
  category: string;
  score: number;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  employmentType: string;
  workMode: string;
  status: string;
}

export interface Opportunity {
  id: string;
  jobId: string;
  professionalProfileId: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'WITHDRAWN';
  acceptedAt: string | null;
  declinedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
}

export interface HiringPipelineStage {
  id: string;
  opportunityId: string;
  stage: string;
  notes: string | null;
  changedAt: string;
}

export interface Post {
  id: string;
  professionalProfileId: string | null;
  companyId: string | null;
  content: string | null;
  visibility: 'VISIBLE_NOW' | 'SCHEDULED' | 'ARCHIVED';
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AttachmentType = 'IMAGE' | 'VIDEO' | 'PDF';

export interface Attachment {
  id: string;
  postId: string | null;
  type: AttachmentType;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  professionalProfileId: string | null;
  companyId: string | null;
  parentCommentId: string | null;
  content: string;
  edited: boolean;
  createdAt: string;
}

export type UserRole = 'PROFESSIONAL' | 'COMPANY_ADMIN' | 'MODERATOR' | 'ADMIN';

export interface AdminUserRecord {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BANNED';
}

export type ModerationTargetType = 'COMPANY' | 'PROFESSIONAL' | 'REVIEW' | 'POST' | 'OPPORTUNITY';

export type ModerationReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'FAKE_REVIEW'
  | 'MISLEADING_JOB'
  | 'IMPERSONATION'
  | 'POLICY_VIOLATION'
  | 'OTHER';

export type ModerationStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'DISMISSED';

export type ModerationActionType =
  | 'NO_ACTION'
  | 'WARNING_ISSUED'
  | 'CONTENT_REMOVED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_BANNED'
  | 'COMPANY_VERIFICATION_REVOKED';

export interface ModerationCase {
  id: string;
  reporterId: string | null;
  targetType: ModerationTargetType;
  targetId: string;
  reason: ModerationReason;
  description: string | null;
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationAction {
  id: string;
  moderationCaseId: string;
  moderatorId: string | null;
  action: ModerationActionType;
  notes: string | null;
  createdAt: string;
}

export interface TrustFlag {
  id: string;
  userId: string | null;
  targetType: string;
  targetId: string;
  reason: string;
  scoreImpact: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata: unknown;
  createdAt: string;
}

export interface CompanyReply {
  id: string;
  reviewId: string;
  reply: string;
  edited: boolean;
  repliedAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  companyId: string;
  employmentHistoryId: string;
  title: string;
  review: string;
  anonymous: boolean;
  recommended: boolean;
  edited: boolean;
  publishedAt: string;
  ratings: ReviewRating[];
}
