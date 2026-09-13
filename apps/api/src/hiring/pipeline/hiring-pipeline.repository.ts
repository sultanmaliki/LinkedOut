import { asc, eq } from 'drizzle-orm';

import { db, hiringPipelines } from '@linkedout/database';

export type HiringPipelineRecord = typeof hiringPipelines.$inferSelect;

export const HIRING_PIPELINE_STAGES = [
  'SCREENING',
  'TECHNICAL',
  'HR',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;

export class HiringPipelineRepository {
  async listByOpportunity(opportunityId: string): Promise<HiringPipelineRecord[]> {
    return db
      .select()
      .from(hiringPipelines)
      .where(eq(hiringPipelines.opportunityId, opportunityId))
      .orderBy(asc(hiringPipelines.changedAt));
  }

  async append(
    opportunityId: string,
    stage: string,
    notes?: string,
  ): Promise<HiringPipelineRecord> {
    const [entry] = await db
      .insert(hiringPipelines)
      .values({ opportunityId, stage, notes })
      .returning();

    if (!entry) {
      throw new Error('Failed to append hiring pipeline stage');
    }

    return entry;
  }
}
