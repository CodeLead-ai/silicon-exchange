/**
 * Overlap detection — owned by increment inc-3.
 *
 * Pure half-open range overlap with cancelled-reservation exclusion.
 * Renders nothing; exports pure functions for downstream modules.
 */

export interface ReservationLike {
  start: string;
  end: string;
  status: string;
}

const CANCELLED = 'cancelled';

/**
 * Half-open interval overlap: [startA, endA) ∩ [startB, endB) ≠ ∅.
 * A reservation ending at T and another starting at T do NOT overlap.
 */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Returns all non-cancelled reservations in `existing` that overlap `candidate`.
 * Cancelled reservations are excluded from the check entirely.
 */
export function findConflicts(
  candidate: ReservationLike,
  existing: ReservationLike[],
): ReservationLike[] {
  return existing.filter(
    (r) =>
      r.status !== CANCELLED &&
      rangesOverlap(candidate.start, candidate.end, r.start, r.end),
  );
}

export function OverlapDetection() {
  return null;
}
