/**
 * Not-found page — owned by increment inc-16.
 *
 * Renders a minimal on-brand 404 for unmatched routes: a large numeral,
 * a short generic message, and a link back to home.
 */
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="empty" style={{ paddingTop: "var(--space-7)", paddingBottom: "var(--space-7)" }}>
      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, display: "block", marginBottom: "var(--space-3)" }}>
        404
      </span>
      <p className="muted" style={{ marginBottom: "var(--space-5)" }}>
        This page doesn't exist.
      </p>
      <Link to="/" className="btn btn--primary">
        Back to home
      </Link>
    </div>
  );
}
