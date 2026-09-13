import { and, eq } from 'drizzle-orm';

import {
  contactMethods,
  db,
  hiringPipelines,
  opportunities,
  opportunitySnapshots,
  professionalResponses,
  type NewContactMethod,
} from '@linkedout/database';

export type OpportunityRecord = typeof opportunities.$inferSelect;
export type ProfessionalResponseRecord = typeof professionalResponses.$inferSelect;
export type ContactMethodRecord = typeof contactMethods.$inferSelect;

export interface CreateOpportunityData {
  jobId: string;
  professionalProfileId: string;
  message?: string;
}

export interface RespondData {
  accepted: boolean;
  message?: string;
  contactMethods?: { type: NewContactMethod['type']; value: string }[];
}

export class OpportunityRepository {
  async existsActiveForJobAndProfile(
    jobId: string,
    professionalProfileId: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.jobId, jobId),
          eq(opportunities.professionalProfileId, professionalProfileId),
          eq(opportunities.status, 'PENDING'),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  async create(
    data: CreateOpportunityData,
    snapshot: Record<string, unknown>,
  ): Promise<OpportunityRecord> {
    return db.transaction(async (tx) => {
      const [opportunity] = await tx
        .insert(opportunities)
        .values({
          jobId: data.jobId,
          professionalProfileId: data.professionalProfileId,
          message: data.message,
        })
        .returning();

      if (!opportunity) {
        throw new Error('Failed to create opportunity');
      }

      await tx.insert(opportunitySnapshots).values({
        opportunityId: opportunity.id,
        snapshot,
      });

      await tx.insert(hiringPipelines).values({
        opportunityId: opportunity.id,
        stage: 'OPPORTUNITY_SENT',
      });

      return opportunity;
    });
  }

  async findById(opportunityId: string): Promise<OpportunityRecord | undefined> {
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, opportunityId))
      .limit(1);

    return opportunity;
  }

  async listByProfessional(professionalProfileId: string): Promise<OpportunityRecord[]> {
    return db
      .select()
      .from(opportunities)
      .where(eq(opportunities.professionalProfileId, professionalProfileId));
  }

  async listByJob(jobId: string): Promise<OpportunityRecord[]> {
    return db.select().from(opportunities).where(eq(opportunities.jobId, jobId));
  }

  async respond(
    opportunityId: string,
    data: RespondData,
  ): Promise<{ opportunity: OpportunityRecord; response: ProfessionalResponseRecord }> {
    return db.transaction(async (tx) => {
      const [opportunity] = await tx
        .update(opportunities)
        .set({
          status: data.accepted ? 'ACCEPTED' : 'DECLINED',
          acceptedAt: data.accepted ? new Date() : null,
          declinedAt: data.accepted ? null : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(opportunities.id, opportunityId))
        .returning();

      if (!opportunity) {
        throw new Error('Failed to update opportunity');
      }

      const [response] = await tx
        .insert(professionalResponses)
        .values({
          opportunityId,
          accepted: data.accepted,
          message: data.message,
        })
        .returning();

      if (!response) {
        throw new Error('Failed to create professional response');
      }

      if (data.accepted && data.contactMethods) {
        await tx.insert(contactMethods).values(
          data.contactMethods.map((method) => ({
            professionalResponseId: response.id,
            type: method.type,
            value: method.value,
          })),
        );
      }

      await tx.insert(hiringPipelines).values({
        opportunityId,
        stage: data.accepted ? 'OPPORTUNITY_ACCEPTED' : 'OPPORTUNITY_DECLINED',
      });

      return { opportunity, response };
    });
  }

  async withdraw(opportunityId: string): Promise<OpportunityRecord | undefined> {
    return db.transaction(async (tx) => {
      const [opportunity] = await tx
        .update(opportunities)
        .set({ status: 'WITHDRAWN', withdrawnAt: new Date(), updatedAt: new Date() })
        .where(eq(opportunities.id, opportunityId))
        .returning();

      if (!opportunity) {
        return undefined;
      }

      await tx.insert(hiringPipelines).values({
        opportunityId,
        stage: 'WITHDRAWN',
      });

      return opportunity;
    });
  }

  async getContactMethods(opportunityId: string): Promise<ContactMethodRecord[]> {
    const [response] = await db
      .select({ id: professionalResponses.id })
      .from(professionalResponses)
      .where(eq(professionalResponses.opportunityId, opportunityId))
      .limit(1);

    if (!response) {
      return [];
    }

    return db
      .select()
      .from(contactMethods)
      .where(eq(contactMethods.professionalResponseId, response.id));
  }
}
