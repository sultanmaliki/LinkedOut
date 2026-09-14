export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
  'APPRENTICESHIP',
] as const;

export const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'] as const;

export const NOTICE_PERIODS = [
  'IMMEDIATE',
  '7_DAYS',
  '15_DAYS',
  '30_DAYS',
  '45_DAYS',
  '60_DAYS',
  '90_DAYS',
  'NEGOTIABLE',
] as const;

export const COMPANY_TYPES = [
  'STARTUP',
  'PRIVATE',
  'PUBLIC',
  'GOVERNMENT',
  'NON_PROFIT',
  'EDUCATIONAL',
] as const;

export const CONTACT_METHOD_TYPES = ['EMAIL', 'PHONE', 'LINKEDIN', 'PORTFOLIO'] as const;

export const HIRING_PIPELINE_STAGES = [
  'SCREENING',
  'TECHNICAL',
  'HR',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;

export const REVIEW_RATING_CATEGORIES = [
  'COMPENSATION',
  'CULTURE',
  'MANAGEMENT',
  'WORK_LIFE_BALANCE',
  'CAREER_GROWTH',
] as const;

export function formatEnum(value: string): string {
  return value
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}
