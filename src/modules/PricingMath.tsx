/**
 * Pricing math — owned by increment inc-4.
 *
 * Pure pricing: 15-min round-up, 1-hr minimum, 10% off hours beyond 24.
 * All monetary values are integer cents. Renders nothing.
 */

const QUARTER_HOUR = 15;
const MINIMUM_MINUTES = 60;
const FULL_RATE_MINUTES = 1440; // 24 hours
const DISCOUNT_RATE = 0.9; // 10% off

/**
 * Calculate the total price in integer cents for a reservation.
 *
 * @param durationMinutes - Raw reservation duration in minutes.
 * @param hourlyRateCents - Hourly rate in integer cents.
 * @returns Total price in integer cents.
 */
export function calculatePrice(
  durationMinutes: number,
  hourlyRateCents: number,
): number {
  // Rule 1: Round up to nearest 15-minute increment
  const roundedMinutes = Math.ceil(durationMinutes / QUARTER_HOUR) * QUARTER_HOUR;

  // Rule 2: Apply 1-hour minimum
  const billedMinutes = Math.max(roundedMinutes, MINIMUM_MINUTES);

  // Rule 3: 10% off for minutes beyond 24 hours (proportional)
  let totalCents: number;
  if (billedMinutes <= FULL_RATE_MINUTES) {
    totalCents = (billedMinutes / 60) * hourlyRateCents;
  } else {
    const fullRateCents = (FULL_RATE_MINUTES / 60) * hourlyRateCents;
    const extraMinutes = billedMinutes - FULL_RATE_MINUTES;
    const discountedCents = (extraMinutes / 60) * hourlyRateCents * DISCOUNT_RATE;
    totalCents = fullRateCents + discountedCents;
  }

  return Math.round(totalCents);
}

export function PricingMath() {
  return null;
}
