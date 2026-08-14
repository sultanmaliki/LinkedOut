import 'dotenv/config';
import { db, client } from '../index';
import {
  users,
  professionalProfiles,
  companies,
  companyProfiles,
  jobs,
  opportunities,
} from '../schema';
const SEED_IDS = {
  professionalUser: '00000000-0000-4000-8000-000000000001',
  professionalProfile: '00000000-0000-4000-8000-000000000002',
  company: '00000000-0000-4000-8000-000000000003',
  companyProfile: '00000000-0000-4000-8000-000000000004',
  job: '00000000-0000-4000-8000-000000000005',
  opportunity: '00000000-0000-4000-8000-000000000006',
};
async function seed() {
  console.log('🌱 Starting LinkedOut seed...');
  // ─────────────────────────────────────────────
  // Professional User
  // ─────────────────────────────────────────────
  await db
    .insert(users)
    .values({
      id: SEED_IDS.professionalUser,
      email: 'seed.professional@linkedout.dev',
      emailVerified: true,
      // Development-only placeholder.
      // This seed user is not intended for authentication.
      passwordHash: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      role: 'PROFESSIONAL',
      status: 'ACTIVE',
    })
    .onConflictDoNothing();
  console.log('✓ Professional user');
  // ─────────────────────────────────────────────
  // Professional Profile
  // ─────────────────────────────────────────────
  await db
    .insert(professionalProfiles)
    .values({
      id: SEED_IDS.professionalProfile,
      userId: SEED_IDS.professionalUser,
      fullName: 'Sultan Maliki',
      headline: 'Full Stack Developer',
      bio: 'Development seed professional for LinkedOut.',
      currentLocation: 'Bengaluru, India',
      personalWebsite: 'https://example.com',
    })
    .onConflictDoNothing();
  console.log('✓ Professional profile');
  // ─────────────────────────────────────────────
  // Company
  // ─────────────────────────────────────────────
  await db
    .insert(companies)
    .values({
      id: SEED_IDS.company,
      legalName: 'LinkedOut Technologies Private Limited',
      displayName: 'LinkedOut Technologies',
      slug: 'linkedout-technologies',
      companyType: 'PRIVATE',
      website: 'https://example.com',
      verified: true,
      verificationStatus: 'VERIFIED',
    })
    .onConflictDoNothing();
  console.log('✓ Company');
  // ─────────────────────────────────────────────
  // Company Profile
  // ─────────────────────────────────────────────
  await db
    .insert(companyProfiles)
    .values({
      id: SEED_IDS.companyProfile,
      companyId: SEED_IDS.company,
      description: 'Development seed company for testing LinkedOut hiring workflows.',
      industry: 'Technology',
      foundedYear: 2026,
      employeeCount: 10,
    })
    .onConflictDoNothing();
  console.log('✓ Company profile');
  // ─────────────────────────────────────────────
  // Job
  // ─────────────────────────────────────────────
  await db
    .insert(jobs)
    .values({
      id: SEED_IDS.job,
      companyId: SEED_IDS.company,
      title: 'Junior Full Stack Developer',
      description: 'Development seed job used to test the LinkedOut hiring workflow.',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      openings: 1,
      salaryMin: 500000,
      salaryMax: 800000,
      currency: 'INR',
      active: true,
      status: 'ACTIVE',
    })
    .onConflictDoNothing();
  console.log('✓ Job');
  // ─────────────────────────────────────────────
  // Opportunity
  // ─────────────────────────────────────────────
  await db
    .insert(opportunities)
    .values({
      id: SEED_IDS.opportunity,
      jobId: SEED_IDS.job,
      professionalProfileId: SEED_IDS.professionalProfile,
      message: 'We would like to invite you to explore this development opportunity.',
      status: 'PENDING',
    })
    .onConflictDoNothing();
  console.log('✓ Opportunity');
  console.log('');
  console.log('🌱 Seed completed successfully.');
  console.log('');
  console.log('Seed data:');
  console.log('  Professional: seed.professional@linkedout.dev');
  console.log('  Company:      LinkedOut Technologies');
  console.log('  Job:          Junior Full Stack Developer');
  console.log('  Opportunity:  PENDING');
}
seed()
  .catch((error) => {
    console.error('❌ Seed failed:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
