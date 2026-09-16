import { Injectable } from '@nestjs/common';

import { CompanyRecord, CompanyRepository } from '../../companies/company.repository';
import { JobRepository } from '../jobs/job.repository';
import { OpportunityRecord, OpportunityRepository } from '../opportunities/opportunity.repository';
import { HiringPipelineRepository } from './hiring-pipeline.repository';
import {
  computeDisplayStatus,
  resolveWindowDays,
  SYSTEM_DEFAULT_OFFER_WINDOW_DAYS,
  SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
} from './pipeline-status.util';

// A rate below this sample size is too noisy to show -- one bad timeout on
// two total opportunities would read as "0% responsive," which is unfair.
// See docs/architecture/hiring-pipeline-v2.md.
const MIN_SAMPLE_SIZE = 5;
const TRAILING_WINDOW_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

const COMPANY_OWNED_STAGES = new Set(['ACCEPTED', 'INTERVIEW_SCHEDULED', 'REVIEWING']);

export interface ResponsivenessScore {
  totalConsidered: number;
  responsiveCount: number;
  // null when totalConsidered is below MIN_SAMPLE_SIZE -- "not enough data
  // yet" rather than a misleadingly harsh (or flattering) percentage.
  rate: number | null;
}

@Injectable()
export class ResponsivenessScoreService {
  constructor(
    private readonly opportunityRepository: OpportunityRepository,
    private readonly pipelineRepository: HiringPipelineRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly jobRepository: JobRepository,
  ) {}

  async getProfessionalScore(professionalProfileId: string): Promise<ResponsivenessScore> {
    const now = new Date();
    const opportunities = (
      await this.opportunityRepository.listByProfessional(professionalProfileId)
    ).filter((o) => this.withinTrailingWindow(o.createdAt, now));

    const companiesById = await this.resolveCompaniesByOpportunity(opportunities);
    const historyByOpportunity = await this.pipelineRepository.listAllByOpportunityIds(
      opportunities.map((o) => o.id),
    );

    let totalConsidered = 0;
    let responsiveCount = 0;

    for (const opportunity of opportunities) {
      const c = companiesById.get(opportunity.id);

      // The SENT turn: every opportunity has exactly one.
      if (
        opportunity.status === 'ACCEPTED' ||
        opportunity.status === 'DECLINED' ||
        opportunity.status === 'WITHDRAWN'
      ) {
        totalConsidered += 1;
        responsiveCount += 1;
      } else if (opportunity.status === 'EXPIRED') {
        totalConsidered += 1;
      } else if (opportunity.status === 'PENDING') {
        const windowDays = resolveWindowDays(
          opportunity.responseWindowDays,
          c?.defaultResponseWindowDays,
          SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
        );
        const status = computeDisplayStatus({
          stage: 'SENT',
          enteredAt: opportunity.createdAt,
          scheduledAt: null,
          effectiveWindowDays: windowDays,
          now,
        });

        if (status.tier === 'hardClosed') {
          totalConsidered += 1;
        }
      }

      // The OFFER_RELEASED turn, if this opportunity ever reached one.
      const history = historyByOpportunity.get(opportunity.id) ?? [];
      const offerIndex = history.findIndex((row) => row.stage === 'OFFER_RELEASED');

      if (offerIndex === -1) {
        continue;
      }

      const offerRow = history[offerIndex]!;
      const laterRow = history[offerIndex + 1];

      if (laterRow) {
        // Anything after OFFER_RELEASED means the professional acted --
        // accept or decline both count as responsive.
        totalConsidered += 1;
        responsiveCount += 1;
        continue;
      }

      const offerWindowDays = resolveWindowDays(
        offerRow.windowDays,
        c?.defaultOfferWindowDays,
        SYSTEM_DEFAULT_OFFER_WINDOW_DAYS,
      );
      const offerStatus = computeDisplayStatus({
        stage: 'OFFER_RELEASED',
        enteredAt: offerRow.changedAt,
        scheduledAt: null,
        effectiveWindowDays: offerWindowDays,
        now,
      });

      if (offerStatus.tier === 'hardClosed') {
        totalConsidered += 1;
      }
    }

    return this.toScore(totalConsidered, responsiveCount);
  }

  async getCompanyScore(companyId: string): Promise<ResponsivenessScore> {
    const now = new Date();
    const opportunities = (await this.opportunityRepository.listByCompanyId(companyId)).filter(
      (o) => this.withinTrailingWindow(o.createdAt, now),
    );

    const latestByOpportunity = await this.pipelineRepository.listLatestByOpportunityIds(
      opportunities.map((o) => o.id),
    );

    let totalConsidered = 0;
    let responsiveCount = 0;

    for (const opportunity of opportunities) {
      const latest = latestByOpportunity.get(opportunity.id);

      if (!latest) {
        continue;
      }

      if (!COMPANY_OWNED_STAGES.has(latest.stage)) {
        // The opportunity moved past every company-owned stage it ever
        // reached (or never reached one at all, if it was never accepted).
        if (opportunity.status === 'ACCEPTED') {
          totalConsidered += 1;
          responsiveCount += 1;
        }
        continue;
      }

      // The latest stage is company-owned -- it's currently their turn.
      const status = computeDisplayStatus({
        stage: latest.stage,
        enteredAt: latest.changedAt,
        scheduledAt: latest.scheduledAt,
        effectiveWindowDays: null,
        now,
      });

      if (opportunity.manuallyFlaggedUnresponsiveAt || status.tier === 'hardClosed') {
        totalConsidered += 1;
      }
    }

    return this.toScore(totalConsidered, responsiveCount);
  }

  private toScore(totalConsidered: number, responsiveCount: number): ResponsivenessScore {
    return {
      totalConsidered,
      responsiveCount,
      rate: totalConsidered >= MIN_SAMPLE_SIZE ? responsiveCount / totalConsidered : null,
    };
  }

  private withinTrailingWindow(date: Date, now: Date): boolean {
    return now.getTime() - date.getTime() <= TRAILING_WINDOW_DAYS * DAY_MS;
  }

  private async resolveCompaniesByOpportunity(
    opportunities: OpportunityRecord[],
  ): Promise<Map<string, CompanyRecord | undefined>> {
    if (opportunities.length === 0) {
      return new Map();
    }

    const jobIds = [...new Set(opportunities.map((o) => o.jobId))];
    const jobs = await this.jobRepository.findByIds(jobIds);
    const companyIdByJobId = new Map(jobs.map((job) => [job.id, job.companyId]));

    const companyIds = [...new Set(jobs.map((job) => job.companyId))];
    const companies = await this.companyRepository.findByIds(companyIds);
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return new Map(
      opportunities.map((opportunity) => [
        opportunity.id,
        companyById.get(companyIdByJobId.get(opportunity.jobId) ?? ''),
      ]),
    );
  }
}
