/**
 * Hold expiry — owned by increment inc-5.
 *
 * Pure hold-expiry: a held reservation older than 10 minutes is expired
 * and frees its slot. Renders nothing; exports pure functions for
 * downstream modules.
 */

export interface HoldLike {
  heldAt: string;
  status: string;
}

const HOLD_TTL_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Returns true if the hold is expired (age strictly greater than 10 minutes).
 * A hold at exactly 10:00 is NOT expired; at 10:01 it IS expired.
 */
export function isHoldExpired(heldAt: string, now: Date | number): boolean {
  const heldMs = new Date(heldAt).getTime();
  const nowMs = typeof now === 'number' ? now : now.getTime();
  return nowMs - heldMs > HOLD_TTL_MS;
}

/**
 * Filters out expired holds from a list of reservations.
 * Only reservations with status 'held' are subject to expiry.
 * Expired holds are removed (they free their time slot).
 */
export function filterExpiredHolds<T extends HoldLike>(
  reservations: T[],
  now: Date | number,
): T[] {
  return reservations.filter(
    (r) => r.status !== 'held' || !isHoldExpired(r.heldAt, now),
  );
}

export function HoldExpiry() {
  return null;
}
