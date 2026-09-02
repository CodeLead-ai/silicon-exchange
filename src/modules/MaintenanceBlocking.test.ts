import { describe, it, expect } from 'vitest';
import { canAcceptNewReservation, getPreservedReservations } from './MaintenanceBlocking';

describe('canAcceptNewReservation', () => {
  it('returns false for a maintenance listing', () => {
    expect(canAcceptNewReservation({ status: 'maintenance' })).toBe(false);
  });

  it('returns true for an available listing', () => {
    expect(canAcceptNewReservation({ status: 'available' })).toBe(true);
  });

  it('returns true for a retired listing (not maintenance)', () => {
    expect(canAcceptNewReservation({ status: 'retired' })).toBe(true);
  });
});

describe('getPreservedReservations', () => {
  it('returns confirmed reservations unchanged on a maintenance listing', () => {
    const listing = { status: 'maintenance' };
    const reservations = [
      { status: 'confirmed', id: 'r1' },
      { status: 'confirmed', id: 'r2' },
      { status: 'cancelled', id: 'r3' },
      { status: 'held', id: 'r4' },
    ];
    const result = getPreservedReservations(listing, reservations);
    expect(result).toEqual([
      { status: 'confirmed', id: 'r1' },
      { status: 'confirmed', id: 'r2' },
    ]);
  });

  it('returns confirmed reservations unchanged on an available listing', () => {
    const listing = { status: 'available' };
    const reservations = [
      { status: 'confirmed', id: 'r1' },
      { status: 'cancelled', id: 'r2' },
    ];
    const result = getPreservedReservations(listing, reservations);
    expect(result).toEqual([{ status: 'confirmed', id: 'r1' }]);
  });

  it('returns empty array when no confirmed reservations exist', () => {
    const listing = { status: 'maintenance' };
    const reservations = [
      { status: 'cancelled', id: 'r1' },
      { status: 'held', id: 'r2' },
    ];
    const result = getPreservedReservations(listing, reservations);
    expect(result).toEqual([]);
  });
});
