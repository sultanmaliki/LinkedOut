import { computeDisplayStatus, resolveWindowDays } from '../pipeline-status.util';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-06-15T00:00:00.000Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * DAY_MS);
}

describe('computeDisplayStatus', () => {
  describe('SENT (professional-owned, hard timer)', () => {
    it('is onTime before the response window elapses', () => {
      const status = computeDisplayStatus({
        stage: 'SENT',
        enteredAt: daysAgo(10),
        scheduledAt: null,
        effectiveWindowDays: 30,
        now: NOW,
      });

      expect(status).toMatchObject({ ownedBy: 'professional', tier: 'onTime' });
      expect(status.daysRemaining).toBeCloseTo(20, 5);
    });

    it('is hardClosed once the window elapses with no response', () => {
      const status = computeDisplayStatus({
        stage: 'SENT',
        enteredAt: daysAgo(31),
        scheduledAt: null,
        effectiveWindowDays: 30,
        now: NOW,
      });

      expect(status.tier).toBe('hardClosed');
      expect(status.daysRemaining).toBeLessThan(0);
    });

    it('falls back to the system default (30d) when no window is resolved', () => {
      const onTime = computeDisplayStatus({
        stage: 'SENT',
        enteredAt: daysAgo(29),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });
      const closed = computeDisplayStatus({
        stage: 'SENT',
        enteredAt: daysAgo(31),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(onTime.tier).toBe('onTime');
      expect(closed.tier).toBe('hardClosed');
    });
  });

  describe('OFFER_RELEASED (professional-owned, hard timer)', () => {
    it('is onTime before the offer window elapses', () => {
      const status = computeDisplayStatus({
        stage: 'OFFER_RELEASED',
        enteredAt: daysAgo(5),
        scheduledAt: null,
        effectiveWindowDays: 14,
        now: NOW,
      });

      expect(status.ownedBy).toBe('professional');
      expect(status.tier).toBe('onTime');
    });

    it('is hardClosed once the offer window elapses', () => {
      const status = computeDisplayStatus({
        stage: 'OFFER_RELEASED',
        enteredAt: daysAgo(15),
        scheduledAt: null,
        effectiveWindowDays: 14,
        now: NOW,
      });

      expect(status.tier).toBe('hardClosed');
    });

    it('falls back to the system default (14d) when no window is resolved', () => {
      const closed = computeDisplayStatus({
        stage: 'OFFER_RELEASED',
        enteredAt: daysAgo(15),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(closed.tier).toBe('hardClosed');
    });
  });

  describe('ACCEPTED (company-owned, soft-only)', () => {
    it('is onTime before the soft-flag threshold', () => {
      const status = computeDisplayStatus({
        stage: 'ACCEPTED',
        enteredAt: daysAgo(5),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.ownedBy).toBe('company');
      expect(status.tier).toBe('onTime');
    });

    it('is softFlag past the threshold, and never hardCloses', () => {
      const justPast = computeDisplayStatus({
        stage: 'ACCEPTED',
        enteredAt: daysAgo(11),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });
      const farPast = computeDisplayStatus({
        stage: 'ACCEPTED',
        enteredAt: daysAgo(400),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(justPast.tier).toBe('softFlag');
      expect(farPast.tier).toBe('softFlag');
    });
  });

  describe('REVIEWING (company-owned, two-tier)', () => {
    it('is onTime before 14 days', () => {
      const status = computeDisplayStatus({
        stage: 'REVIEWING',
        enteredAt: daysAgo(10),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('onTime');
    });

    it('is softFlag between 14 and 30 days', () => {
      const status = computeDisplayStatus({
        stage: 'REVIEWING',
        enteredAt: daysAgo(20),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('softFlag');
    });

    it('is hardClosed past 30 days', () => {
      const status = computeDisplayStatus({
        stage: 'REVIEWING',
        enteredAt: daysAgo(31),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('hardClosed');
    });
  });

  describe('INTERVIEW_SCHEDULED (company-owned, anchored to scheduledAt)', () => {
    it('is onTime before the interview date', () => {
      const status = computeDisplayStatus({
        stage: 'INTERVIEW_SCHEDULED',
        enteredAt: daysAgo(20),
        scheduledAt: daysAgo(-5),
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('onTime');
    });

    it('is softFlag 10-30 days after the interview date', () => {
      const status = computeDisplayStatus({
        stage: 'INTERVIEW_SCHEDULED',
        enteredAt: daysAgo(30),
        scheduledAt: daysAgo(15),
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('softFlag');
    });

    it('is hardClosed 30+ days after the interview date', () => {
      const status = computeDisplayStatus({
        stage: 'INTERVIEW_SCHEDULED',
        enteredAt: daysAgo(150),
        scheduledAt: daysAgo(31),
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('hardClosed');
    });

    it('falls back to enteredAt as the anchor when scheduledAt is missing', () => {
      const status = computeDisplayStatus({
        stage: 'INTERVIEW_SCHEDULED',
        enteredAt: daysAgo(31),
        scheduledAt: null,
        effectiveWindowDays: null,
        now: NOW,
      });

      expect(status.tier).toBe('hardClosed');
    });
  });

  describe('terminal stages', () => {
    it.each(['OFFER_ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN'] as const)(
      '%s has no owner, no deadline, and tier terminal',
      (stage) => {
        const status = computeDisplayStatus({
          stage,
          enteredAt: daysAgo(1000),
          scheduledAt: null,
          effectiveWindowDays: null,
          now: NOW,
        });

        expect(status).toEqual({
          stage,
          ownedBy: null,
          deadline: null,
          tier: 'terminal',
          daysRemaining: null,
        });
      },
    );
  });
});

describe('resolveWindowDays', () => {
  it('prefers the per-entry override', () => {
    expect(resolveWindowDays(21, 14, 30)).toBe(21);
  });

  it('falls back to the company default when no override is set', () => {
    expect(resolveWindowDays(null, 14, 30)).toBe(14);
    expect(resolveWindowDays(undefined, 14, 30)).toBe(14);
  });

  it('falls back to the system default when neither is set', () => {
    expect(resolveWindowDays(null, null, 30)).toBe(30);
    expect(resolveWindowDays(undefined, undefined, 30)).toBe(30);
  });
});
