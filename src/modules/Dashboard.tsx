/**
 * Dashboard — owned by increment inc-14.
 *
 * Shows the user's active reservations with live countdown timers on
 * held ones, cancel buttons, and running total spend.
 */
import { useEffect, useMemo, useState } from "react";
import { LISTINGS } from "../data";
import { useApp } from "./SharedStateAndPersistence";
import { calculatePrice } from "./PricingMath";
import { isHoldExpired } from "./HoldExpiry";

const HOLD_TTL_MS = 10 * 60 * 1000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Dashboard() {
  const { state, dispatch } = useApp();
  const [now, setNow] = useState(() => Date.now());

  // Tick every second to drive countdown timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-expire held reservations that have passed TTL
  useEffect(() => {
    state.reservations.forEach((r) => {
      if (r.status === "held" && isHoldExpired(r.heldAt, now)) {
        dispatch({ type: "expire", payload: { id: r.id } });
      }
    });
  }, [now, state.reservations, dispatch]);

  // Active reservations (held or confirmed only)
  const activeReservations = useMemo(
    () =>
      state.reservations.filter(
        (r) => r.status === "held" || r.status === "confirmed",
      ),
    [state.reservations],
  );

  // Total spend: sum of all confirmed reservations in integer cents
  const totalSpendCents = useMemo(() => {
    return state.reservations
      .filter((r) => r.status === "confirmed")
      .reduce((sum, r) => {
        const listing = LISTINGS.find((l) => l.id === r.listingSlug);
        if (!listing) return sum;
        const durationMs =
          new Date(r.end).getTime() - new Date(r.start).getTime();
        const durationMinutes = durationMs / 60000;
        return sum + calculatePrice(durationMinutes, listing.rateCentsPerHour);
      }, 0);
  }, [state.reservations]);

  function handleCancel(id: string) {
    dispatch({ type: "cancel", payload: { id } });
  }

  if (activeReservations.length === 0) {
    return <div className="empty">No active reservations.</div>;
  }

  return (
    <div className="stack">
      <div className="statrow">
        <div className="stat">
          <span className="microlabel">Total spend</span>
          <b className="num">${(totalSpendCents / 100).toFixed(2)}</b>
        </div>
        <div className="stat">
          <span className="microlabel">Active</span>
          <b className="num">{activeReservations.length}</b>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Listing</th>
            <th>Window</th>
            <th>Status</th>
            <th>Cost</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {activeReservations.map((r) => {
            const listing = LISTINGS.find((l) => l.id === r.listingSlug);
            const durationMs =
              new Date(r.end).getTime() - new Date(r.start).getTime();
            const durationMinutes = durationMs / 60000;
            const costCents = listing
              ? calculatePrice(durationMinutes, listing.rateCentsPerHour)
              : 0;

            const remainingMs =
              r.status === "held"
                ? HOLD_TTL_MS - (now - new Date(r.heldAt).getTime())
                : 0;

            return (
              <tr key={r.id}>
                <td>
                  <span className="mono">{r.listingSlug}</span>
                  {listing && (
                    <span
                      className="muted"
                      style={{ marginLeft: "var(--space-2)" }}
                    >
                      {listing.name}
                    </span>
                  )}
                </td>
                <td className="num">
                  {formatDateTime(r.start)} → {formatDateTime(r.end)}
                </td>
                <td>
                  {r.status === "held" ? (
                    <span className="status status--maintenance">
                      <span className="dot" />
                      held ·{" "}
                      <span className="num">{formatCountdown(remainingMs)}</span>
                    </span>
                  ) : (
                    <span className="status status--available">
                      <span className="dot" />
                      confirmed
                    </span>
                  )}
                </td>
                <td className="num">${(costCents / 100).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn--ghost"
                    onClick={() => handleCancel(r.id)}
                    aria-label={`Cancel reservation ${r.id}`}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
