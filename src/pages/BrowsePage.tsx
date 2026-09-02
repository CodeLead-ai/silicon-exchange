import { BrowsePage as BrowsePageModule } from "../modules/BrowsePage";

/**
 * /browse — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function BrowsePage() {
  return (
    <>
      <BrowsePageModule />
    </>
  );
}
