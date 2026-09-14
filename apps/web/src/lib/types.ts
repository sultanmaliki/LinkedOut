export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
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
