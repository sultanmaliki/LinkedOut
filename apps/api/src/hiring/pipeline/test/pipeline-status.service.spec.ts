import { PipelineStatusService } from '../pipeline-status.service';
import type { OpportunityRecord } from '../../opportunities/opportunity.repository';

describe('PipelineStatusService', () => {
  const pipelineRepository = {
    listLatestByOpportunityIds: jest.fn(),
  };

  const service = new PipelineStatusService(pipelineRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function opportunity(overrides: Record<string, unknown> = {}): OpportunityRecord {
    return {
      id: 'opportunity-1',
      createdAt: new Date(),
      responseWindowDays: null,
      manuallyFlaggedUnresponsiveAt: null,
      ...overrides,
    } as unknown as OpportunityRecord;
  }

  it('decorates an opportunity using its latest pipeline stage', async () => {
    pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(
      new Map([
        [
          'opportunity-1',
          { stage: 'SENT', changedAt: new Date(), scheduledAt: null, windowDays: null },
        ],
      ]),
    );

    const [decorated] = await service.decorate([opportunity()], new Map());

    expect(decorated.displayStatus.stage).toBe('SENT');
    expect(decorated.displayStatus.ownedBy).toBe('professional');
  });

  it('falls back to a SENT status when no pipeline row exists yet', async () => {
    pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(new Map());

    const [decorated] = await service.decorate([opportunity()], new Map());

    expect(decorated.displayStatus.stage).toBe('SENT');
  });

  it('resolves the SENT window from the company default when no per-send override exists', async () => {
    pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(new Map());
    const enteredJustPastCompanyDefault = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000);

    const [decorated] = await service.decorate(
      [opportunity({ createdAt: enteredJustPastCompanyDefault })],
      new Map([['opportunity-1', { defaultResponseWindowDays: 21 } as never]]),
    );

    // 22 days elapsed > company's 21-day default (well under the 30-day
    // system default), so this should already be hardClosed.
    expect(decorated.displayStatus.tier).toBe('hardClosed');
  });

  it('overrides tier to hardClosed when manually flagged, for a company-owned stage', async () => {
    pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(
      new Map([
        [
          'opportunity-1',
          { stage: 'REVIEWING', changedAt: new Date(), scheduledAt: null, windowDays: null },
        ],
      ]),
    );

    const [decorated] = await service.decorate(
      [opportunity({ manuallyFlaggedUnresponsiveAt: new Date() })],
      new Map(),
    );

    expect(decorated.displayStatus.tier).toBe('hardClosed');
  });

  it('does not let a manual flag override a professional-owned stage', async () => {
    pipelineRepository.listLatestByOpportunityIds.mockResolvedValue(
      new Map([
        [
          'opportunity-1',
          { stage: 'SENT', changedAt: new Date(), scheduledAt: null, windowDays: null },
        ],
      ]),
    );

    const [decorated] = await service.decorate(
      [opportunity({ manuallyFlaggedUnresponsiveAt: new Date() })],
      new Map(),
    );

    expect(decorated.displayStatus.tier).toBe('onTime');
  });

  it('returns an empty array for an empty input without querying the repository', async () => {
    const result = await service.decorate([], new Map());

    expect(result).toEqual([]);
    expect(pipelineRepository.listLatestByOpportunityIds).not.toHaveBeenCalled();
  });
});
