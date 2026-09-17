import { Injectable } from '@nestjs/common';

import { CompanyRecord } from '../../companies/company.repository';
import { OpportunityRecord } from '../opportunities/opportunity.repository';
import { HiringPipelineRecord, HiringPipelineRepository } from './hiring-pipeline.repository';
import {
  computeDisplayStatus,
  DisplayStatus,
  resolveWindowDays,
  SYSTEM_DEFAULT_OFFER_WINDOW_DAYS,
  SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
} from './pipeline-status.util';

export type WithDisplayStatus<T> = T & { displayStatus: DisplayStatus };

@Injectable()
export class PipelineStatusService {
  constructor(private readonly pipelineRepository: HiringPipelineRepository) {}

  /**
   * Decorates a batch of opportunities with their computed display status.
   * Generic over T so callers whose query joined extra columns (e.g. the
   * professional's name) keep them on the decorated result.
   * `companiesById` only needs to contain the companies relevant to the
   * given opportunities (via their job) -- callers that already know a
   * single company (job-scoped or company-scoped listings) can pass a
   * one-entry map.
   */
  async decorate<T extends OpportunityRecord>(
    opportunities: T[],
    companiesById: Map<string, CompanyRecord | undefined>,
  ): Promise<WithDisplayStatus<T>[]> {
    if (opportunities.length === 0) {
      return [];
    }

    const latestStageByOpportunity = await this.pipelineRepository.listLatestByOpportunityIds(
      opportunities.map((o) => o.id),
    );

    const now = new Date();

    return opportunities.map((opportunity) => {
      const latestStage = latestStageByOpportunity.get(opportunity.id);
      const company = companiesById.get(opportunity.id);

      let displayStatus = latestStage
        ? this.computeForRow(opportunity, latestStage, company, now)
        : this.computeFallback(opportunity, company, now);

      if (
        opportunity.manuallyFlaggedUnresponsiveAt &&
        displayStatus.ownedBy === 'company' &&
        displayStatus.tier !== 'terminal'
      ) {
        displayStatus = { ...displayStatus, tier: 'hardClosed' };
      }

      return { ...opportunity, displayStatus };
    });
  }

  private computeForRow(
    opportunity: OpportunityRecord,
    latestStage: HiringPipelineRecord,
    company: CompanyRecord | undefined,
    now: Date,
  ): DisplayStatus {
    const effectiveWindowDays = this.resolveEffectiveWindow(latestStage, opportunity, company);

    return computeDisplayStatus({
      stage: latestStage.stage,
      enteredAt: latestStage.changedAt,
      scheduledAt: latestStage.scheduledAt,
      effectiveWindowDays,
      now,
    });
  }

  // Defensive fallback for an opportunity with no hiring_pipelines row yet
  // (shouldn't happen in practice -- OpportunityRepository.create always
  // writes a SENT row in the same transaction -- but a pure read path
  // should never throw over a data inconsistency it can reasonably infer
  // past).
  private computeFallback(
    opportunity: OpportunityRecord,
    company: CompanyRecord | undefined,
    now: Date,
  ): DisplayStatus {
    const windowDays = resolveWindowDays(
      opportunity.responseWindowDays,
      company?.defaultResponseWindowDays,
      SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
    );

    return computeDisplayStatus({
      stage: 'SENT',
      enteredAt: opportunity.createdAt,
      scheduledAt: null,
      effectiveWindowDays: windowDays,
      now,
    });
  }

  private resolveEffectiveWindow(
    latestStage: HiringPipelineRecord,
    opportunity: OpportunityRecord,
    company: CompanyRecord | undefined,
  ): number | null {
    if (latestStage.stage === 'SENT') {
      return resolveWindowDays(
        opportunity.responseWindowDays,
        company?.defaultResponseWindowDays,
        SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
      );
    }

    if (latestStage.stage === 'OFFER_RELEASED') {
      return resolveWindowDays(
        latestStage.windowDays,
        company?.defaultOfferWindowDays,
        SYSTEM_DEFAULT_OFFER_WINDOW_DAYS,
      );
    }

    return null;
  }
}
