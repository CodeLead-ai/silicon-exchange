/**
 * Typed mock data constants for Silicon Exchange.
 * Owned by increment inc-2 (TypedMockData).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ListingStatus = "available" | "maintenance" | "retired";

export interface Listing {
  id: string;
  name: string;
  chip: string;
  memoryGb: number;
  tflops: number;
  region: string;
  rateCentsPerHour: number;
  status: ListingStatus;
}

export interface Reservation {
  id: string;
  listingId: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  userId: string;
}

// ─── Seeded PRNG (mulberry32) ────────────────────────────────────────────────

const SEED = 42;

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Listings (24 across 5 regions) ─────────────────────────────────────────

export const LISTINGS: Listing[] = [
  // us-east-1 (6)
  { id: "lst-001", name: "A100 80G — East", chip: "NVIDIA A100", memoryGb: 80, tflops: 312, region: "us-east-1", rateCentsPerHour: 1250, status: "available" },
  { id: "lst-002", name: "H100 80G — East", chip: "NVIDIA H100", memoryGb: 80, tflops: 989, region: "us-east-1", rateCentsPerHour: 2500, status: "available" },
  { id: "lst-003", name: "B200 192G — East", chip: "NVIDIA B200", memoryGb: 192, tflops: 2250, region: "us-east-1", rateCentsPerHour: 4500, status: "available" },
  { id: "lst-004", name: "L40S 48G — East", chip: "NVIDIA L40S", memoryGb: 48, tflops: 362, region: "us-east-1", rateCentsPerHour: 800, status: "available" },
  { id: "lst-005", name: "MI300X 192G — East", chip: "AMD MI300X", memoryGb: 192, tflops: 1307, region: "us-east-1", rateCentsPerHour: 3200, status: "maintenance" },
  { id: "lst-006", name: "Gaudi 3 128G — East", chip: "Intel Gaudi 3", memoryGb: 128, tflops: 458, region: "us-east-1", rateCentsPerHour: 1800, status: "available" },

  // us-west-2 (5)
  { id: "lst-007", name: "A100 80G — West", chip: "NVIDIA A100", memoryGb: 80, tflops: 312, region: "us-west-2", rateCentsPerHour: 1100, status: "available" },
  { id: "lst-008", name: "H100 80G — West", chip: "NVIDIA H100", memoryGb: 80, tflops: 989, region: "us-west-2", rateCentsPerHour: 2400, status: "available" },
  { id: "lst-009", name: "L40S 48G — West", chip: "NVIDIA L40S", memoryGb: 48, tflops: 362, region: "us-west-2", rateCentsPerHour: 750, status: "retired" },
  { id: "lst-010", name: "MI300X 192G — West", chip: "AMD MI300X", memoryGb: 192, tflops: 1307, region: "us-west-2", rateCentsPerHour: 3100, status: "available" },
  { id: "lst-011", name: "B200 192G — West", chip: "NVIDIA B200", memoryGb: 192, tflops: 2250, region: "us-west-2", rateCentsPerHour: 4400, status: "available" },

  // eu-west-1 (5)
  { id: "lst-012", name: "A100 80G — EU", chip: "NVIDIA A100", memoryGb: 80, tflops: 312, region: "eu-west-1", rateCentsPerHour: 1300, status: "available" },
  { id: "lst-013", name: "H100 80G — EU", chip: "NVIDIA H100", memoryGb: 80, tflops: 989, region: "eu-west-1", rateCentsPerHour: 2600, status: "maintenance" },
  { id: "lst-014", name: "Gaudi 3 128G — EU", chip: "Intel Gaudi 3", memoryGb: 128, tflops: 458, region: "eu-west-1", rateCentsPerHour: 1900, status: "available" },
  { id: "lst-015", name: "L40S 48G — EU", chip: "NVIDIA L40S", memoryGb: 48, tflops: 362, region: "eu-west-1", rateCentsPerHour: 850, status: "available" },
  { id: "lst-016", name: "MI300X 192G — EU", chip: "AMD MI300X", memoryGb: 192, tflops: 1307, region: "eu-west-1", rateCentsPerHour: 3300, status: "available" },

  // ap-south-1 (4)
  { id: "lst-017", name: "A100 80G — South", chip: "NVIDIA A100", memoryGb: 80, tflops: 312, region: "ap-south-1", rateCentsPerHour: 1000, status: "available" },
  { id: "lst-018", name: "H100 80G — South", chip: "NVIDIA H100", memoryGb: 80, tflops: 989, region: "ap-south-1", rateCentsPerHour: 2300, status: "available" },
  { id: "lst-019", name: "L40S 48G — South", chip: "NVIDIA L40S", memoryGb: 48, tflops: 362, region: "ap-south-1", rateCentsPerHour: 700, status: "retired" },
  { id: "lst-020", name: "Gaudi 3 128G — South", chip: "Intel Gaudi 3", memoryGb: 128, tflops: 458, region: "ap-south-1", rateCentsPerHour: 1700, status: "available" },

  // ap-northeast-1 (4)
  { id: "lst-021", name: "B200 192G — NE", chip: "NVIDIA B200", memoryGb: 192, tflops: 2250, region: "ap-northeast-1", rateCentsPerHour: 4600, status: "available" },
  { id: "lst-022", name: "H100 80G — NE", chip: "NVIDIA H100", memoryGb: 80, tflops: 989, region: "ap-northeast-1", rateCentsPerHour: 2550, status: "maintenance" },
  { id: "lst-023", name: "MI300X 192G — NE", chip: "AMD MI300X", memoryGb: 192, tflops: 1307, region: "ap-northeast-1", rateCentsPerHour: 3250, status: "available" },
  { id: "lst-024", name: "A100 80G — NE", chip: "NVIDIA A100", memoryGb: 80, tflops: 312, region: "ap-northeast-1", rateCentsPerHour: 1150, status: "available" },
];

// ─── Utilization samples (30 days × 24 listings, deterministic) ─────────────

export const UTILIZATION: Record<string, number[]> = (() => {
  const rng = mulberry32(SEED);
  const result: Record<string, number[]> = {};
  for (const l of LISTINGS) {
    result[l.id] = Array.from({ length: 30 }, () => Math.floor(rng() * 101));
  }
  return result;
})();

// ─── Pre-existing reservations ───────────────────────────────────────────────

export const RESERVATIONS: Reservation[] = [
  { id: "res-001", listingId: "lst-001", start: "2026-09-10T00:00:00Z", end: "2026-09-12T00:00:00Z", userId: "user-alpha" },
  { id: "res-002", listingId: "lst-001", start: "2026-09-11T00:00:00Z", end: "2026-09-13T00:00:00Z", userId: "user-beta" },
  { id: "res-003", listingId: "lst-002", start: "2026-09-14T00:00:00Z", end: "2026-09-15T00:00:00Z", userId: "user-gamma" },
  { id: "res-004", listingId: "lst-008", start: "2026-09-16T00:00:00Z", end: "2026-09-18T00:00:00Z", userId: "user-delta" },
  { id: "res-005", listingId: "lst-012", start: "2026-09-20T00:00:00Z", end: "2026-09-21T00:00:00Z", userId: "user-epsilon" },
];
