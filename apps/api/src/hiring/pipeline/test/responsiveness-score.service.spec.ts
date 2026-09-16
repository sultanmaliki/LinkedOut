import { ResponsivenessScoreService } from '../responsiveness-score.service';

describe('ResponsivenessScoreService', () => {
  const opportunityRepository = {
    listByProfessional: jest.fn(),
    listByCompanyId: jest.fn(),
  };

  const pipelineRepository = {
    listAllByOpportunityIds: jest.fn(),
    listLatestByOpportunityIds: jest.fn(),
  };

  const companyRepository = {
    findByIds: jest.fn(),
  };

  const jobRepository = {
    findByIds: jest.fn(),
  };

  const service = new ResponsivenessScoreService(
    opportunityRepository as never,
    pipelineRepository as never,
    companyRepository as never,
    jobRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jobRepository.findByIds.mockResolvedValue([]);
    companyRepository.findByIds.mockResolvedValue([]);
  });

  function opportunity(overrides: Record<string, unknown>) {
    return {
      id: 'opportunity-1',
      jobId: 'job-1',
      status: 'PENDING',
      responseWindowDays: null,
      manuallyFlaggedUnresponsiveAt: null,
      createdAt: new Date(),
      ...overrides,
    };
  }

  describe('getProfessionalScore', () => {
    it('returns null rate below the minimum sample size', async () => {
      opportunityRepository.listByProfessional.mockResolvedValue([
        opportunity({ id: 'o1', status: 'ACCEPTED' }),
      ]);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(new Map());

      const score = await service.getProfessionalScore('profile-1');

      expect(score.totalConsidered).toBe(1);
      expect(score.rate).toBeNull();
    });

    it('counts an explicit decline as responsive, not just an accept', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({ id: `o${i}`, status: i === 0 ? 'DECLINED' : 'ACCEPTED' }),
      );
      opportunityRepository.listByProfessional.mockResolvedValue(opportunities);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(new Map());

      const score = await service.getProfessionalScore('profile-1');

      expect(score.totalConsidered).toBe(5);
      expect(score.responsiveCount).toBe(5);
      expect(score.rate).toBe(1);
    });

    it('counts a still-open PENDING opportunity within its window as not yet resolved', async () => {
      const opportunities = [
        ...Array.from({ length: 4 }, (_, i) => opportunity({ id: `o${i}`, status: 'ACCEPTED' })),
        opportunity({
          id: 'o-open',
          status: 'PENDING',
          createdAt: new Date(),
        }),
      ];
      opportunityRepository.listByProfessional.mockResolvedValue(opportunities);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(new Map());

      const score = await service.getProfessionalScore('profile-1');

      // The still-open PENDING opportunity is excluded, so only the 4
      // resolved ones count -- below the 5-sample floor.
      expect(score.totalConsidered).toBe(4);
      expect(score.rate).toBeNull();
    });

    it('counts a PENDING opportunity past its window as an unresolved-unresponsive timeout', async () => {
      const longAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      const opportunities = [
        ...Array.from({ length: 4 }, (_, i) => opportunity({ id: `o${i}`, status: 'ACCEPTED' })),
        opportunity({ id: 'o-stale', status: 'PENDING', createdAt: longAgo }),
      ];
      opportunityRepository.listByProfessional.mockResolvedValue(opportunities);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(new Map());

      const score = await service.getProfessionalScore('profile-1');

      expect(score.totalConsidered).toBe(5);
      expect(score.responsiveCount).toBe(4);
      expect(score.rate).toBe(0.8);
    });

    it('counts a resolved offer turn (accept or decline) as responsive', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({ id: `o${i}`, status: 'ACCEPTED' }),
      );
      opportunityRepository.listByProfessional.mockResolvedValue(opportunities);

      const history = new Map();
      history.set('o0', [
        { stage: 'OFFER_RELEASED', changedAt: new Date(), windowDays: null },
        { stage: 'OFFER_ACCEPTED', changedAt: new Date() },
      ]);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(history);

      const score = await service.getProfessionalScore('profile-1');

      // 5 SENT turns + 1 OFFER turn, all responsive.
      expect(score.totalConsidered).toBe(6);
      expect(score.responsiveCount).toBe(6);
    });

    it('counts a lapsed offer (still OFFER_RELEASED, past its window) as unresponsive', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({ id: `o${i}`, status: 'ACCEPTED' }),
      );
      opportunityRepository.listByProfessional.mockResolvedValue(opportunities);

      const longAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const history = new Map();
      history.set('o0', [{ stage: 'OFFER_RELEASED', changedAt: longAgo, windowDays: null }]);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(history);

      const score = await service.getProfessionalScore('profile-1');

      // 5 responsive SENT turns + 1 unresponsive OFFER turn.
      expect(score.totalConsidered).toBe(6);
      expect(score.responsiveCount).toBe(5);
    });

    it('excludes opportunities outside the trailing 12-month window', async () => {
      const tooOld = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
      opportunityRepository.listByProfessional.mockResolvedValue([
        opportunity({ id: 'o1', status: 'ACCEPTED', createdAt: tooOld }),
      ]);
      pipelineRepository.listAllByOpportunityIds.mockResolvedValue(new Map());

      const score = await service.getProfessionalScore('profile-1');

      expect(score.totalConsidered).toBe(0);
    });
  });

  describe('getCompanyScore', () => {
    it('counts an opportunity that moved past every company-owned stage as responsive', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({ id: `o${i}`, status: 'ACCEPTED' }),
      );
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const latest = new Map();
      for (const o of opportunities) {
        latest.set(o.id, { stage: 'OFFER_RELEASED', changedAt: new Date(), scheduledAt: null });
      }
      pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(latest);

      const score = await service.getCompanyScore('company-1');

      expect(score.totalConsidered).toBe(5);
      expect(score.responsiveCount).toBe(5);
    });

    it('counts a company-owned stage past its hard-close threshold as unresponsive', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({ id: `o${i}`, status: 'ACCEPTED' }),
      );
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const longAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      const latest = new Map();
      for (const o of opportunities) {
        latest.set(o.id, { stage: 'REVIEWING', changedAt: longAgo, scheduledAt: null });
      }
      pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(latest);

      const score = await service.getCompanyScore('company-1');

      expect(score.totalConsidered).toBe(5);
      expect(score.responsiveCount).toBe(0);
    });

    it('counts a manually-flagged opportunity as unresponsive even before the hard threshold', async () => {
      const opportunities = Array.from({ length: 5 }, (_, i) =>
        opportunity({
          id: `o${i}`,
          status: 'ACCEPTED',
          manuallyFlaggedUnresponsiveAt: i === 0 ? new Date() : null,
        }),
      );
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const latest = new Map();
      for (const o of opportunities) {
        // Just entered, well within the soft-flag window.
        latest.set(o.id, { stage: 'REVIEWING', changedAt: new Date(), scheduledAt: null });
      }
      pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(latest);

      const score = await service.getCompanyScore('company-1');

      // Only the manually-flagged one is resolved; the other 4 are still
      // onTime and excluded.
      expect(score.totalConsidered).toBe(1);
      expect(score.responsiveCount).toBe(0);
    });

    it('excludes an opportunity still onTime in a company-owned stage', async () => {
      const opportunities = [opportunity({ id: 'o1', status: 'ACCEPTED' })];
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const latest = new Map();
      latest.set('o1', { stage: 'ACCEPTED', changedAt: new Date(), scheduledAt: null });
      pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(latest);

      const score = await service.getCompanyScore('company-1');

      expect(score.totalConsidered).toBe(0);
    });

    it('does not count an opportunity that was never accepted', async () => {
      const opportunities = [opportunity({ id: 'o1', status: 'DECLINED' })];
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const latest = new Map();
      latest.set('o1', { stage: 'DECLINED', changedAt: new Date(), scheduledAt: null });
      pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(latest);

      const score = await service.getCompanyScore('company-1');

      expect(score.totalConsidered).toBe(0);
    });
  });
});
