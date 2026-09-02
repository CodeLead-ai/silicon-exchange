import { Dashboard } from "../modules/Dashboard";

/**
 * /dashboard — this route's single product surface. Modules owned by this
 * route's increments render here and nowhere else.
 */
export function DashboardPage() {
  return (
    <>
      <Dashboard />
    </>
  );
}
