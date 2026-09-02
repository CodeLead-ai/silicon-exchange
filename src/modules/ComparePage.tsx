/**
 * Compare page — owned by increment inc-15.
 *
 * Compact listing picker (all 24, toggle up to 3) and a side-by-side
 * spec table with diff highlighting on rows where values differ.
 * Selection persists via the SharedStateAndPersistence context.
 */
import { LISTINGS, type Listing } from "../data";
import { useApp } from "./SharedStateAndPersistence";

const COMPARE_MAX = 3;

interface SpecRow {
  label: string;
  key: keyof Listing;
  format?: (l: Listing) => string;
}

const SPEC_ROWS: SpecRow[] = [
  { label: "Chip", key: "chip" },
  { label: "Memory", key: "memoryGb", format: (l) => `${l.memoryGb} GB` },
  { label: "TFLOPS", key: "tflops" },
  { label: "Region", key: "region" },
  { label: "Rate", key: "rateCentsPerHour", format: (l) => `$${(l.rateCentsPerHour / 100).toFixed(2)}/hr` },
  { label: "Status", key: "status" },
];

export function ComparePage() {
  const { state, dispatch } = useApp();
  const { compareSelection } = state;

  const selectedListings: Listing[] = compareSelection
    .map((slug) => LISTINGS.find((l) => l.id === slug))
    .filter((l): l is Listing => l !== undefined);

  function toggle(slug: string) {
    if (compareSelection.includes(slug)) {
      dispatch({ type: "removeCompare", payload: { slug } });
    } else if (compareSelection.length < COMPARE_MAX) {
      dispatch({ type: "addCompare", payload: { slug } });
    }
  }

  function rowDiffers(row: SpecRow): boolean {
    if (selectedListings.length < 2) return false;
    const values = selectedListings.map((l) =>
      row.format ? row.format(l) : String(l[row.key]),
    );
    return new Set(values).size > 1;
  }

  return (
    <div className="stack">
      {/* Listing picker */}
      <div className="panel panel--pad">
        <div className="microlabel" style={{ marginBottom: "var(--space-3)" }}>
          Select up to {COMPARE_MAX} listings
        </div>
        <div style={{ maxHeight: "22rem", overflowY: "auto" }}>
          {LISTINGS.map((l) => {
            const isSelected = compareSelection.includes(l.id);
            const isFull = compareSelection.length >= COMPARE_MAX && !isSelected;
            return (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span className={`status status--${l.status}`}>
                  <span className="dot" />
                </span>
                <span className="mono num" style={{ fontSize: "0.72rem", color: "var(--muted)", minWidth: "4.5rem" }}>
                  {l.id}
                </span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.name}
                </span>
                <span className="microlabel" style={{ minWidth: "5.5rem", textAlign: "right" }}>
                  {l.region}
                </span>
                <button
                  className={`btn ${isSelected ? "btn--primary" : ""}`}
                  style={{ padding: "0.15rem 0.5rem", fontSize: "var(--text-sm)", minWidth: "2rem" }}
                  disabled={isFull}
                  onClick={() => toggle(l.id)}
                  aria-label={isSelected ? `Remove ${l.name}` : `Add ${l.name}`}
                >
                  {isSelected ? "✓" : "+"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spec comparison table */}
      {selectedListings.length < 2 ? (
        <div className="empty">
          {selectedListings.length === 0
            ? "Select at least two listings to see specs side by side."
            : "Select one more listing to see specs side by side."}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "8rem" }} />
              {selectedListings.map((l) => (
                <th key={l.id}>
                  <div className="card__id mono">{l.id}</div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{l.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row) => {
              const differs = rowDiffers(row);
              return (
                <tr key={String(row.key)} style={differs ? { background: "var(--surface-2)" } : undefined}>
                  <td>
                    <span className="microlabel">{row.label}</span>
                  </td>
                  {selectedListings.map((l) => (
                    <td key={l.id}>
                      {row.key === "status" ? (
                        <span className={`status status--${l.status}`}>
                          <span className="dot" />
                          {l.status}
                        </span>
                      ) : row.format ? (
                        <span className="num">{row.format(l)}</span>
                      ) : (
                        <span className="num">{String(l[row.key])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
