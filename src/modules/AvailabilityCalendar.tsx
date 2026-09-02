/**
 * Availability calendar — owned by increment inc-12.
 *
 * 7-day × 24-hour grid showing slot availability for the current listing.
 * Reads reservations from the shared context; blocks confirmed and held
 * slots; shows all slots blocked for maintenance listings.
 */
import { useMemo } from "react";
import type { Listing } from "../data";
import { useApp } from "./SharedStateAndPersistence";
import { isHoldExpired } from "./HoldExpiry";
import { canAcceptNewReservation } from "./MaintenanceBlocking";

type SlotState = "available" | "held" | "confirmed" | "blocked";

const HOURS = 24;
const DAYS = 7;

export function AvailabilityCalendar({ listing }: { listing: Listing }) {
  const { state } = useApp();
  const now = useMemo(() => new Date(), []);

  // 7 days starting from today (midnight local)
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      result.push(d);
    }
    return result;
  }, [now]);

  // Reservations for this listing
  const listingReservations = useMemo(
    () => state.reservations.filter((r) => r.listingSlug === listing.id),
    [state.reservations, listing.id],
  );

  const isMaintenance = !canAcceptNewReservation(listing);

  // Build slot-state map: key = `${dayIdx}-${hour}`
  const slotStates = useMemo(() => {
    const map = new Map<string, SlotState>();

    if (isMaintenance) {
      for (let d = 0; d < DAYS; d++) {
        for (let h = 0; h < HOURS; h++) {
          map.set(`${d}-${h}`, "blocked");
        }
      }
      return map;
    }

    // Default: all available
    for (let d = 0; d < DAYS; d++) {
      for (let h = 0; h < HOURS; h++) {
        map.set(`${d}-${h}`, "available");
      }
    }

    // Mark reserved slots
    for (const res of listingReservations) {
      if (res.status === "cancelled" || res.status === "expired") continue;
      if (res.status === "held" && isHoldExpired(res.heldAt, now)) continue;

      const resStart = new Date(res.start);
      const resEnd = new Date(res.end);

      for (let d = 0; d < DAYS; d++) {
        for (let h = 0; h < HOURS; h++) {
          const slotStart = new Date(days[d]);
          slotStart.setHours(h, 0, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(h + 1, 0, 0, 0);

          if (slotStart < resEnd && slotEnd > resStart) {
            const key = `${d}-${h}`;
            if (res.status === "confirmed") {
              map.set(key, "confirmed");
            } else if (res.status === "held") {
              const cur = map.get(key);
              if (cur === "available") {
                map.set(key, "held");
              }
            }
          }
        }
      }
    }

    return map;
  }, [listingReservations, isMaintenance, days, now]);

  // Day header labels
  const dayLabels = days.map((d) => ({
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
  }));

  return (
    <div className="panel panel--pad">
      {/* Legend */}
      <div className="row" style={{ marginBottom: "var(--space-3)" }}>
        <span className="status status--available">
          <span className="dot" />
          Available
        </span>
        <span className="status status--maintenance">
          <span className="dot" />
          Held
        </span>
        <span className="status status--retired">
          <span className="dot" />
          Confirmed
        </span>
        {isMaintenance && (
          <span className="status status--maintenance">
            <span className="dot" />
            Maintenance
          </span>
        )}
      </div>

      {/* 7-day × 24-hour grid */}
      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ fontSize: "var(--text-sm)" }}>
          <thead>
            <tr>
              <th style={{ width: "3.5rem" }} />
              {dayLabels.map((d, i) => (
                <th key={i} style={{ textAlign: "center", minWidth: "2.75rem" }}>
                  <div className="microlabel">{d.weekday}</div>
                  <div className="num" style={{ fontSize: "0.72rem" }}>{d.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: HOURS }, (_, h) => (
              <tr key={h}>
                <td
                  className="mono num"
                  style={{ fontSize: "0.7rem", color: "var(--muted)", whiteSpace: "nowrap", padding: "0.15rem var(--space-2)" }}
                >
                  {String(h).padStart(2, "0")}:00
                </td>
                {Array.from({ length: DAYS }, (_, d) => {
                  const s = slotStates.get(`${d}-${h}`) ?? "available";
                  let bg = "transparent";
                  let opacity = 0;
                  if (s === "confirmed") {
                    bg = "var(--danger)";
                    opacity = 0.4;
                  } else if (s === "held") {
                    bg = "var(--warn)";
                    opacity = 0.4;
                  } else if (s === "blocked") {
                    bg = "var(--danger)";
                    opacity = 0.55;
                  }
                  return (
                    <td
                      key={d}
                      style={{ padding: "1px", width: "2.75rem", height: "1.3rem", textAlign: "center" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: bg,
                          opacity,
                          borderRadius: "2px",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
