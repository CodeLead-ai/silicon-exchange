/**
 * Browse page — owned by increment inc-10.
 *
 * Filterable, sortable listing grid with URL-query-string state.
 */
import { Link, useSearchParams } from "react-router-dom";
import { LISTINGS, UTILIZATION, type Listing } from "../data";
import {
  filterListings,
  sortListings,
  type ListingLike,
  type SortField,
  type SortDirection,
  type FilterCriteria,
} from "./FilterAndSortLogic";

// ─── Data mapping ────────────────────────────────────────────────────────────

function toListingLike(l: Listing): ListingLike {
  const samples = UTILIZATION[l.id] ?? [];
  const avgUtil =
    samples.length > 0
      ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      : 0;
  return {
    id: l.id,
    name: l.name,
    region: l.region,
    memory: l.memoryGb,
    tFlops: l.tflops,
    utilization: avgUtil,
    price: l.rateCentsPerHour,
    status: l.status,
  };
}

const ALL: ListingLike[] = LISTINGS.map(toListingLike);
const REGIONS = [...new Set(LISTINGS.map((l) => l.region))].sort();
const MEM_OPTIONS = [...new Set(LISTINGS.map((l) => l.memoryGb))].sort(
  (a, b) => a - b,
);

// ─── Component ───────────────────────────────────────────────────────────────

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const region = searchParams.get("region") ?? "";
  const memMin = searchParams.get("memMin") ?? "";
  const memMax = searchParams.get("memMax") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const dir = (searchParams.get("dir") ?? "asc") as SortDirection;

  // Build criteria
  const criteria: FilterCriteria = {};
  if (q) criteria.search = q;
  if (region) criteria.region = region;
  if (memMin) criteria.memoryMin = Number(memMin);
  if (memMax) criteria.memoryMax = Number(memMax);
  if (status) criteria.status = status;

  // Filter
  const filtered = filterListings(ALL, criteria);

  // Sort (only when a sort field is selected)
  const results = sort
    ? sortListings(filtered, sort as SortField, dir)
    : filtered;

  // ─── URL update helpers ────────────────────────────────────────────────────

  function updateSearch(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section>
      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search GPUs…"
          value={q}
          onChange={(e) => updateSearch(e.target.value)}
          style={{ maxWidth: "180px" }}
        />
        <select
          className="select"
          value={region}
          onChange={(e) => updateParam("region", e.target.value)}
        >
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={memMin}
          onChange={(e) => updateParam("memMin", e.target.value)}
        >
          <option value="">Mem min</option>
          {MEM_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} GB
            </option>
          ))}
        </select>
        <select
          className="select"
          value={memMax}
          onChange={(e) => updateParam("memMax", e.target.value)}
        >
          <option value="">Mem max</option>
          {MEM_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} GB
            </option>
          ))}
        </select>
        <select
          className="select"
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="">All status</option>
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
        <select
          className="select"
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="">Sort</option>
          <option value="price">Price</option>
          <option value="memory">Memory</option>
          <option value="tFlops">TFLOPS</option>
          <option value="utilization">Utilization</option>
        </select>
        {sort && (
          <button
            onClick={() =>
              updateParam("dir", dir === "asc" ? "desc" : "asc")
            }
            aria-label={`Sort ${dir === "asc" ? "ascending" : "descending"}`}
          >
            {dir === "asc" ? "↑" : "↓"}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="empty">No listings match the current criteria.</div>
      ) : (
        <div className="grid">
          {results.map((l) => (
            <Link
              key={l.id}
              to={`/listings/${l.id}`}
              className="card"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="card__head">
                <span className="card__id mono">{l.id}</span>
                <span className={`status status--${l.status}`}>
                  <span className="dot" />
                  {l.status}
                </span>
              </div>
              <h3 className="card__name">{l.name}</h3>
              <div className="metrics">
                <div className="metric">
                  <span className="microlabel">Memory</span>
                  <b className="num">{l.memory} GB</b>
                </div>
                <div className="metric">
                  <span className="microlabel">TFLOPS</span>
                  <b className="num">{l.tFlops}</b>
                </div>
                <div className="metric">
                  <span className="microlabel">Region</span>
                  <b className="num">{l.region}</b>
                </div>
                <div className="metric">
                  <span className="microlabel">Utilization</span>
                  <b className="num">{l.utilization}%</b>
                </div>
              </div>
              <div className="card__foot">
                <span className="price">
                  ${(l.price / 100).toFixed(2)}
                  <small>/hr</small>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
