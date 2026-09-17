import { and, eq, inArray } from 'drizzle-orm';

import { db, jobs, opportunities, type NewJob } from '@linkedout/database';

export type JobRecord = typeof jobs.$inferSelect;

export type CreateJobData = Omit<NewJob, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;

export type UpdateJobData = Partial<CreateJobData>;

export class JobRepository {
  async create(companyId: string, data: CreateJobData): Promise<JobRecord> {
    const [job] = await db
      .insert(jobs)
      .values({ companyId, ...data })
      .returning();

    if (!job) {
      throw new Error('Failed to create job');
    }

    return job;
  }

  async listByCompany(companyId: string): Promise<JobRecord[]> {
    return db.select().from(jobs).where(eq(jobs.companyId, companyId));
  }

  async findById(jobId: string): Promise<JobRecord | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    return job;
  }

  async findByIds(jobIds: string[]): Promise<JobRecord[]> {
    if (jobIds.length === 0) {
      return [];
    }

    return db.select().from(jobs).where(inArray(jobs.id, jobIds));
  }

  async findByIdForCompany(companyId: string, jobId: string): Promise<JobRecord | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.companyId, companyId), eq(jobs.id, jobId)))
      .limit(1);

    return job;
  }

  async updateById(
    companyId: string,
    jobId: string,
    data: UpdateJobData,
  ): Promise<JobRecord | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(jobs.companyId, companyId), eq(jobs.id, jobId)))
      .returning();

    return job;
  }

  async expirePendingOpportunities(jobId: string): Promise<void> {
    await db
      .update(opportunities)
      .set({ status: 'EXPIRED', updatedAt: new Date() })
      .where(and(eq(opportunities.jobId, jobId), eq(opportunities.status, 'PENDING')));
  }
}
