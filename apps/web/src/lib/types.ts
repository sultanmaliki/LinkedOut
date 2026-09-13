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
