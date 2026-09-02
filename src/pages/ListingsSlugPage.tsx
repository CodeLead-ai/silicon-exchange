import { SpecSheetAndUtilizationChart } from "../modules/SpecSheetAndUtilizationChart";
import { AvailabilityCalendar } from "../modules/AvailabilityCalendar";
import { ReservationFormWithLivePricing } from "../modules/ReservationFormWithLivePricing";

/**
 * /listings/:slug — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function ListingsSlugPage() {
  return (
    <>
      <SpecSheetAndUtilizationChart />
      <AvailabilityCalendar />
      <ReservationFormWithLivePricing />
    </>
  );
}
