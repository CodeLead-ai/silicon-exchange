import { ComparePage as ComparePageModule } from "../modules/ComparePage";

/**
 * /compare — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function ComparePage() {
  return (
    <>
      <ComparePageModule />
    </>
  );
}
