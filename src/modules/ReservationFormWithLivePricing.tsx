/**
 * Reservation form with live pricing — owned by increment inc-13.
 *
 * Two datetime-local inputs constrained to the 7-day calendar window,
 * a live quote panel (base hours, rounding, discount, total), and a
 * submit that creates a held reservation in shared state after
 * overlap validation.
 */
import { useMemo, useState, type FormEvent } from "react";
import type { Listing } from "../data";
import { useApp, type Reservation } from "./SharedStateAndPersistence";
import { getPricingBreakdown } from "./PricingMath";
import { findConflicts } from "./OverlapDetection";
import { canAcceptNewReservation } from "./MaintenanceBlocking";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalDatetimeStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fmtHours(minutes: number): string {
  const h = minutes / 60;
  return h % 1 === 0 ? `${h}` : h.toFixed(1);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReservationFormWithLivePricing({ listing }: { listing: Listing }) {
  const { state, dispatch } = useApp();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 7-day window matching the calendar
  const { minVal, maxVal } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate.setHours(23, 59, 0, 0);
    return { minVal: toLocalDatetimeStr(today), maxVal: toLocalDatetimeStr(maxDate) };
  }, []);

  // Live quote — recalculates on every input change
  const quote = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const durationMs = e.getTime() - s.getTime();
    if (durationMs <= 0) return null;
    const durationMinutes = durationMs / 60000;
    return getPricingBreakdown(durationMinutes, listing.rateCentsPerHour);
  }, [start, end, listing.rateCentsPerHour]);

  const canSubmit =
    canAcceptNewReservation(listing) &&
    !!start &&
    !!end &&
    new Date(end) > new Date(start);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();

    // Overlap validation
    const candidate = { start: startISO, end: endISO, status: "held" };
    const listingReservations = state.reservations.filter(
      (r) => r.listingSlug === listing.id,
    );
    const conflicts = findConflicts(candidate, listingReservations);
    if (conflicts.length > 0) {
      setError("This time range overlaps an existing reservation.");
      return;
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      listingSlug: listing.id,
      start: startISO,
      end: endISO,
      status: "held",
      heldAt: new Date().toISOString(),
    };

    dispatch({ type: "add", payload: reservation });
    setStart("");
    setEnd("");
  }

  return (
    <div className="panel panel--pad">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div>
            <label className="label" htmlFor="res-start">Start</label>
            <input
              id="res-start"
              className="input"
              type="datetime-local"
              value={start}
              min={minVal}
              max={maxVal}
              onChange={(e) => { setStart(e.target.value); setError(null); }}
              style={{ maxWidth: "200px" }}
            />
          </div>
          <div>
            <label className="label" htmlFor="res-end">End</label>
            <input
              id="res-end"
              className="input"
              type="datetime-local"
              value={end}
              min={minVal}
              max={maxVal}
              onChange={(e) => { setEnd(e.target.value); setError(null); }}
              style={{ maxWidth: "200px" }}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSubmit}
          >
            Hold
          </button>
        </div>

        {error && (
          <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)", margin: "var(--space-2) 0 0" }}>
            {error}
          </p>
        )}

        {quote && (
          <div className="statrow" style={{ marginTop: "var(--space-4)" }}>
            <div className="stat">
              <span className="microlabel">Base</span>
              <b className="num">{fmtHours(quote.baseMinutes)} hrs</b>
            </div>
            <div className="stat">
              <span className="microlabel">Rounded</span>
              <b className="num">{quote.roundingNote}</b>
            </div>
            <div className="stat">
              <span className="microlabel">Discount</span>
              <b className="num">{quote.discountNote}</b>
            </div>
            <div className="stat">
              <span className="microlabel">Total</span>
              <b className="num">${(quote.totalCents / 100).toFixed(2)}</b>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
