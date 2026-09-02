/**
 * Maintenance blocking — owned by increment inc-6.
 *
 * Pure rule: maintenance listings reject new reservations but retain
 * confirmed ones. Renders nothing; exports pure functions for
 * downstream modules.
 */

export interface ListingLike {
  status: string;
}

export interface ReservationLike {
  status: string;
}

const MAINTENANCE = 'maintenance';
const CONFIRMED = 'confirmed';

/**
 * Returns true if the listing can accept new reservations.
 * A listing in maintenance status rejects all new bookings.
 */
export function canAcceptNewReservation(listing: ListingLike): boolean {
  return listing.status !== MAINTENANCE;
}

/**
 * Returns confirmed reservations unchanged, regardless of listing status.
 * Maintenance listings retain their existing confirmed reservations.
 */
export function getPreservedReservations<T extends ReservationLike>(
  _listing: ListingLike,
  reservations: T[],
): T[] {
  return reservations.filter((r) => r.status === CONFIRMED);
}

export function MaintenanceBlocking() {
  return null;
}
