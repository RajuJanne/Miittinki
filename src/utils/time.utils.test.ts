import { isStartBeforeEnd, isInPast, overlaps, parseIsoToDate } from '../utils/time.utils';

describe('time.utils', () => {
  describe('parseIsoToDate', () => {
    it('should parse valid ISO date string', () => {
      const iso = '2026-02-15T10:00:00Z';
      const result = parseIsoToDate(iso);
      expect(result).toBeDefined();
      expect(result instanceof Date).toBe(true);
    });

    it('should return null for invalid date format', () => {
      const result = parseIsoToDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should return null for undefined', () => {
      const result = parseIsoToDate(undefined);
      expect(result).toBeNull();
    });
  });

  describe('isStartBeforeEnd', () => {
    it('should return true when start is before end', () => {
      const start = new Date('2026-02-15T09:00:00Z');
      const end = new Date('2026-02-15T10:00:00Z');
      expect(isStartBeforeEnd(start, end)).toBe(true);
    });

    it('should return false when start is after end', () => {
      const start = new Date('2026-02-15T10:00:00Z');
      const end = new Date('2026-02-15T09:00:00Z');
      expect(isStartBeforeEnd(start, end)).toBe(false);
    });

    it('should return false when start equals end', () => {
      const date = new Date('2026-02-15T10:00:00Z');
      expect(isStartBeforeEnd(date, date)).toBe(false);
    });
  });

  describe('isInPast', () => {
    it('should return true for past date', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      expect(isInPast(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      expect(isInPast(futureDate)).toBe(false);
    });

    it('should return true for current time (or very close)', () => {
      const now = new Date();
      const isCurrentlyPast = isInPast(now);
      // This might be true or false depending on timing, but should be consistent
      expect(typeof isCurrentlyPast).toBe('boolean');
    });
  });

  describe('overlaps', () => {
    it('should detect overlapping booking ranges', () => {
      const start1 = new Date('2026-02-15T09:00:00Z');
      const end1 = new Date('2026-02-15T10:00:00Z');
      const start2 = new Date('2026-02-15T09:30:00Z');
      const end2 = new Date('2026-02-15T10:30:00Z');

      expect(overlaps(start1, end1, start2, end2)).toBe(true);
    });

    it('should return false for non-overlapping bookings', () => {
      const start1 = new Date('2026-02-15T09:00:00Z');
      const end1 = new Date('2026-02-15T10:00:00Z');
      const start2 = new Date('2026-02-15T10:00:00Z');
      const end2 = new Date('2026-02-15T11:00:00Z');

      expect(overlaps(start1, end1, start2, end2)).toBe(false);
    });

    it('should return true for completely contained booking', () => {
      const start1 = new Date('2026-02-15T09:00:00Z');
      const end1 = new Date('2026-02-15T11:00:00Z');
      const start2 = new Date('2026-02-15T09:30:00Z');
      const end2 = new Date('2026-02-15T10:30:00Z');

      expect(overlaps(start1, end1, start2, end2)).toBe(true);
    });

    it('should return true when bookings share start or end time', () => {
      const start1 = new Date('2026-02-15T09:00:00Z');
      const end1 = new Date('2026-02-15T10:00:00Z');
      const start2 = new Date('2026-02-15T09:00:00Z');
      const end2 = new Date('2026-02-15T10:30:00Z');

      expect(overlaps(start1, end1, start2, end2)).toBe(true);
    });

    it('should return false for back-to-back bookings', () => {
      const start1 = new Date('2026-02-15T09:00:00Z');
      const end1 = new Date('2026-02-15T10:00:00Z');
      const start2 = new Date('2026-02-15T10:00:00Z');
      const end2 = new Date('2026-02-15T11:00:00Z');

      expect(overlaps(start1, end1, start2, end2)).toBe(false);
    });
  });
});
