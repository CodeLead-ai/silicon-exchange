/**
 * Home page — owned by increment inc-9.
 *
 * Renders the hero, live GPU-online counter, three feature cards,
 * and a CTA to /browse.
 */
import { Link } from "react-router-dom";
import { LISTINGS } from "../data";

export function HomePage() {
  const availableCount = LISTINGS.filter((l) => l.status === "available").length;

  return (
    <section>
      <span className="kicker">GPU Marketplace</span>
      <h1>Reserve compute capacity on demand</h1>
      <p className="muted">
        Browse, compare, and reserve GPU listings with transparent per-hour pricing.
      </p>
      <div className="row">
        <Link to="/browse" className="btn btn--primary">
          Browse GPUs
        </Link>
        <div className="stat">
          <span className="microlabel">GPUs online</span>
          <b className="num">{availableCount}</b>
        </div>
      </div>

      <hr className="hairline" />

      <div className="grid">
        <div className="card">
          <div className="card__head">
            <h3 className="card__name">Discover</h3>
          </div>
          <p className="muted">Find available GPU capacity across regions and memory tiers.</p>
        </div>
        <div className="card">
          <div className="card__head">
            <h3 className="card__name">Reserve</h3>
          </div>
          <p className="muted">Lock in time slots with transparent per-hour pricing.</p>
        </div>
        <div className="card">
          <div className="card__head">
            <h3 className="card__name">Compare</h3>
          </div>
          <p className="muted">Line up specs side by side to pick the right fit.</p>
        </div>
      </div>
    </section>
  );
}
