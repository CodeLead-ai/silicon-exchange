import { describe, it, expect } from 'vitest';
import { isHoldExpired, filterExpiredHolds } from './HoldExpiry';

describe('isHoldExpired', () => {
  const baseTime = new Date('2026-09-02T10:00:00.000Z').getTime();

  it('a hold at exactly 10 minutes is NOT expired', () => {
    const heldAt = new Date(baseTime).toISOString();
    const now = new Date(baseTime + 10 * 60 * 1000);
    expect(isHoldExpired(heldAt, now)).toBe(false);
  });

  it('a hold at 10 minutes + 1 second IS expired', () => {
    const heldAt = new Date(baseTime).toISOString();
    const now = new Date(baseTime + 10 * 60 * 1000 + 1000);
    expect(isHoldExpired(heldAt, now)).toBe(true);
  });

  it('a hold at 9 minutes is NOT expired', () => {
    const heldAt = new Date(baseTime).toISOString();
    const now = new Date(baseTime + 9 * 60 * 1000);
    expect(isHoldExpired(heldAt, now)).toBe(false);
  });

  it('a hold at 0 seconds is NOT expired', () => {
    const heldAt = new Date(baseTime).toISOString();
    const now = new Date(baseTime);
    expect(isHoldExpired(heldAt, now)).toBe(false);
  });

  it('accepts now as a number (epoch ms)', () => {
    const heldAt = new Date(baseTime).toISOString();
    expect(isHoldExpired(heldAt, baseTime + 10 * 60 * 1000)).toBe(false);
    expect(isHoldExpired(heldAt, baseTime + 10 * 60 * 1000 + 1)).toBe(true);
  });
});

describe('filterExpiredHolds', () => {
  const baseTime = new Date('2026-09-02T10:00:00.000Z').getTime();

  it('removes expired holds and keeps active ones', () => {
    const reservations = [
      { id: 'r1', heldAt: new Date(baseTime).toISOString(), status: 'held', start: '2026-09-02T12:00:00Z', end: '2026-09-02T13:00:00Z' },
      { id: 'r2', heldAt: new Date(baseTime - 11 * 60 * 1000).toISOString(), status: 'held', start: '2026-09-02T14:00:00Z', end: '2026-09-02T15:00:00Z' },
      { id: 'r3', heldAt: new Date(baseTime).toISOString(), status: 'confirmed', start: '2026-09-02T16:00:00Z', end: '2026-09-02T17:00:00Z' },
    ];
    const now = new Date(baseTime + 10 * 60 * 1000 + 1000);

    const result = filterExpiredHolds(reservations, now);
    // r1: held at baseTime, age = 10min+1sec → expired → removed
    // r2: held at baseTime-11min, age = 21min+1sec → expired → removed
    // r3: confirmed → not subject to expiry → kept
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r3');
  });

  it('keeps a hold at exactly 10 minutes (boundary)', () => {
    const reservations = [
      { id: 'r1', heldAt: new Date(baseTime).toISOString(), status: 'held', start: '2026-09-02T12:00:00Z', end: '2026-09-02T13:00:00Z' },
    ];
    const now = new Date(baseTime + 10 * 60 * 1000);

    const result = filterExpiredHolds(reservations, now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('expired holds free their time slot (excluded from result)', () => {
    const reservations = [
      { id: 'r1', heldAt: new Date(baseTime - 11 * 60 * 1000).toISOString(), status: 'held', start: '2026-09-02T12:00:00Z', end: '2026-09-02T13:00:00Z' },
    ];
    const now = new Date(baseTime);

    const result = filterExpiredHolds(reservations, now);
    expect(result).toHaveLength(0);
  });

  it('does not affect cancelled reservations', () => {
    const reservations = [
      { id: 'r1', heldAt: new Date(baseTime - 999 * 60 * 1000).toISOString(), status: 'cancelled', start: '2026-09-02T12:00:00Z', end: '2026-09-02T13:00:00Z' },
    ];
    const now = new Date(baseTime);

    const result = filterExpiredHolds(reservations, now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });
});
