import { asc, eq, inArray } from 'drizzle-orm';

import { db, hiringPipelines } from '@linkedout/database';

export type HiringPipelineRecord = typeof hiringPipelines.$inferSelect;
export type PipelineStage = HiringPipelineRecord['stage'];

// The subset of PipelineStage a company can manually append via the API.
// SENT/ACCEPTED/DECLINED/WITHDRAWN/OFFER_ACCEPTED are all professional-driven
// lifecycle stages: SENT/ACCEPTED/DECLINED/WITHDRAWN are written by
// OpportunityRepository in response to the professional's initial
// accept/decline, and OFFER_ACCEPTED is written only by
// OpportunityService.respondToOffer when the professional explicitly
// accepts a released offer. None of these belong here -- a company admin
// must never be able to fabricate the professional's own consent by
// appending them directly through this endpoint.
export const HIRING_PIPELINE_STAGES = [
  'INTERVIEW_SCHEDULED',
  'REVIEWING',
  'OFFER_RELEASED',
  'REJECTED',
] as const;

export interface AppendStageData {
  stage: PipelineStage;
  notes?: string;
  scheduledAt?: Date;
  windowDays?: number;
}

export class HiringPipelineRepository {
  async listByOpportunity(opportunityId: string): Promise<HiringPipelineRecord[]> {
    return db
      .select()
      .from(hiringPipelines)
      .where(eq(hiringPipelines.opportunityId, opportunityId))
      .orderBy(asc(hiringPipelines.changedAt));
  }

  // Latest stage row per opportunity, for batch status decoration. Fetches
  // every row for the given opportunities and reduces in application code
  // rather than a DISTINCT ON query -- simplest correct option at this
  // dataset size (see PROJECT_STATUS.md "Known gaps" re: no indexes yet).
  async listLatestByOpportunityIds(
    opportunityIds: string[],
  ): Promise<Map<string, HiringPipelineRecord>> {
    if (opportunityIds.length === 0) {
      return new Map();
    }

    const rows = await db
      .select()
      .from(hiringPipelines)
      .where(inArray(hiringPipelines.opportunityId, opportunityIds))
      .orderBy(asc(hiringPipelines.changedAt));

    const latest = new Map<string, HiringPipelineRecord>();

    for (const row of rows) {
      latest.set(row.opportunityId, row);
    }

    return latest;
  }

  // Full ordered stage history for a batch of opportunities, grouped by
  // opportunity id -- used by ResponsivenessScoreService, which needs to
  // know what followed a given stage, not just the current one.
  async listAllByOpportunityIds(
    opportunityIds: string[],
  ): Promise<Map<string, HiringPipelineRecord[]>> {
    if (opportunityIds.length === 0) {
      return new Map();
    }

    const rows = await db
      .select()
      .from(hiringPipelines)
      .where(inArray(hiringPipelines.opportunityId, opportunityIds))
      .orderBy(asc(hiringPipelines.changedAt));

    const grouped = new Map<string, HiringPipelineRecord[]>();

    for (const row of rows) {
      const existing = grouped.get(row.opportunityId);

      if (existing) {
        existing.push(row);
      } else {
        grouped.set(row.opportunityId, [row]);
      }
    }

    return grouped;
  }

  async append(opportunityId: string, data: AppendStageData): Promise<HiringPipelineRecord> {
    const [entry] = await db
      .insert(hiringPipelines)
      .values({
        opportunityId,
        stage: data.stage,
        notes: data.notes,
        scheduledAt: data.scheduledAt,
        windowDays: data.windowDays,
      })
      .returning();

    if (!entry) {
      throw new Error('Failed to append hiring pipeline stage');
    }

    return entry;
  }
}
