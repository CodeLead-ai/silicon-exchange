import { useParams } from "react-router-dom";
import { LISTINGS } from "../data";
import { SpecSheetAndUtilizationChart } from "../modules/SpecSheetAndUtilizationChart";
import { AvailabilityCalendar } from "../modules/AvailabilityCalendar";
import { ReservationFormWithLivePricing } from "../modules/ReservationFormWithLivePricing";

/**
 * /listings/:slug — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function ListingsSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const listing = LISTINGS.find((l) => l.id === slug);

  if (!listing) {
    return <div className="empty">Listing not found.</div>;
  }

  return (
    <>
      <SpecSheetAndUtilizationChart listing={listing} />
      <AvailabilityCalendar listing={listing} />
      <ReservationFormWithLivePricing listing={listing} />
    </>
  );
}
