import { describe, it, expect } from 'vitest';
import { rangesOverlap, findConflicts, type ReservationLike } from './OverlapDetection';

describe('rangesOverlap', () => {
  it('returns false when one range ends exactly where the other starts (half-open boundary)', () => {
    // [10:00, 14:00) and [14:00, 18:00) — no overlap
    expect(
      rangesOverlap(
        '2026-01-01T10:00:00Z',
        '2026-01-01T14:00:00Z',
        '2026-01-01T14:00:00Z',
        '2026-01-01T18:00:00Z',
      ),
    ).toBe(false);
  });

  it('returns false when the second range ends exactly where the first starts (half-open boundary)', () => {
    // [14:00, 18:00) and [10:00, 14:00) — no overlap
    expect(
      rangesOverlap(
        '2026-01-01T14:00:00Z',
        '2026-01-01T18:00:00Z',
        '2026-01-01T10:00:00Z',
        '2026-01-01T14:00:00Z',
      ),
    ).toBe(false);
  });

  it('returns true when ranges actually overlap', () => {
    // [10:00, 15:00) and [12:00, 18:00) — overlap from 12:00 to 15:00
    expect(
      rangesOverlap(
        '2026-01-01T10:00:00Z',
        '2026-01-01T15:00:00Z',
        '2026-01-01T12:00:00Z',
        '2026-01-01T18:00:00Z',
      ),
    ).toBe(true);
  });

  it('returns true when one range is fully contained in the other', () => {
    // [10:00, 18:00) contains [12:00, 14:00)
    expect(
      rangesOverlap(
        '2026-01-01T10:00:00Z',
        '2026-01-01T18:00:00Z',
        '2026-01-01T12:00:00Z',
        '2026-01-01T14:00:00Z',
      ),
    ).toBe(true);
  });

  it('returns false for completely disjoint ranges', () => {
    // [10:00, 12:00) and [14:00, 16:00)
    expect(
      rangesOverlap(
        '2026-01-01T10:00:00Z',
        '2026-01-01T12:00:00Z',
        '2026-01-01T14:00:00Z',
        '2026-01-01T16:00:00Z',
      ),
    ).toBe(false);
  });
});

describe('findConflicts', () => {
  const active: ReservationLike = {
    start: '2026-01-01T10:00:00Z',
    end: '2026-01-01T14:00:00Z',
    status: 'confirmed',
  };
  const cancelled: ReservationLike = {
    start: '2026-01-01T12:00:00Z',
    end: '2026-01-01T16:00:00Z',
    status: 'cancelled',
  };
  const overlapping: ReservationLike = {
    start: '2026-01-01T13:00:00Z',
    end: '2026-01-01T17:00:00Z',
    status: 'confirmed',
  };
  const boundary: ReservationLike = {
    start: '2026-01-01T14:00:00Z',
    end: '2026-01-01T18:00:00Z',
    status: 'confirmed',
  };

  it('ignores cancelled reservations in overlap checks', () => {
    const result = findConflicts(active, [cancelled]);
    expect(result).toHaveLength(0);
  });

  it('returns overlapping non-cancelled reservations', () => {
    const result = findConflicts(active, [overlapping]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(overlapping);
  });

  it('does not flag a reservation that starts exactly when the candidate ends', () => {
    const result = findConflicts(active, [boundary]);
    expect(result).toHaveLength(0);
  });

  it('filters cancelled while returning active conflicts', () => {
    const result = findConflicts(active, [cancelled, overlapping, boundary]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(overlapping);
  });

  it('returns empty array when no conflicts exist', () => {
    const result = findConflicts(active, [boundary, cancelled]);
    expect(result).toHaveLength(0);
  });
});
