import { TypedMockData } from "../modules/TypedMockData";
import { OverlapDetection } from "../modules/OverlapDetection";
import { PricingMath } from "../modules/PricingMath";
import { HoldExpiry } from "../modules/HoldExpiry";
import { MaintenanceBlocking } from "../modules/MaintenanceBlocking";
import { FilterAndSortLogic } from "../modules/FilterAndSortLogic";
import { SharedStateAndPersistence } from "../modules/SharedStateAndPersistence";
import { HomePage as HomePageModule } from "../modules/HomePage";
import { NotFoundPage } from "../modules/NotFoundPage";
import { Polish } from "../modules/Polish";

/**
 * / — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function HomePage() {
  return (
    <>
      <TypedMockData />
      <OverlapDetection />
      <PricingMath />
      <HoldExpiry />
      <MaintenanceBlocking />
      <FilterAndSortLogic />
      <SharedStateAndPersistence />
      <HomePageModule />
      <NotFoundPage />
      <Polish />
    </>
  );
}
