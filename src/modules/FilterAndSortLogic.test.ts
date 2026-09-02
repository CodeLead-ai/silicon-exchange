import { describe, it, expect } from 'vitest';
import {
  filterListings,
  sortListings,
  queryListings,
  type ListingLike,
} from './FilterAndSortLogic';

const mockListings: ListingLike[] = [
  { id: 'gpu-001', name: 'A100 80GB', region: 'us-east', memory: 80, tFlops: 312, utilization: 72, price: 12000, status: 'available' },
  { id: 'gpu-002', name: 'H100 SXM', region: 'us-east', memory: 80, tFlops: 989, utilization: 85, price: 18000, status: 'available' },
  { id: 'gpu-003', name: 'A100 40GB', region: 'eu-west', memory: 40, tFlops: 312, utilization: 45, price: 8000, status: 'maintenance' },
  { id: 'gpu-004', name: 'V100 32GB', region: 'us-east', memory: 32, tFlops: 125, utilization: 60, price: 5000, status: 'available' },
  { id: 'gpu-005', name: 'H100 PCIe', region: 'eu-west', memory: 80, tFlops: 756, utilization: 90, price: 16000, status: 'retired' },
  { id: 'gpu-006', name: 'A100 80GB', region: 'ap-south', memory: 80, tFlops: 312, utilization: 30, price: 11000, status: 'available' },
];

describe('filterListings', () => {
  it('filters by region', () => {
    const result = filterListings(mockListings, { region: 'us-east' });
    expect(result).toHaveLength(3);
    expect(result.every((l) => l.region === 'us-east')).toBe(true);
  });

  it('filters by memory range (inclusive)', () => {
    const result = filterListings(mockListings, { memoryMin: 40, memoryMax: 80 });
    expect(result).toHaveLength(5);
    expect(result.every((l) => l.memory >= 40 && l.memory <= 80)).toBe(true);
  });

  it('filters by status', () => {
    const result = filterListings(mockListings, { status: 'available' });
    expect(result).toHaveLength(4);
    expect(result.every((l) => l.status === 'available')).toBe(true);
  });

  it('filters by search (case-insensitive substring on name)', () => {
    const result = filterListings(mockListings, { search: 'a100' });
    expect(result).toHaveLength(3);
    expect(result.every((l) => l.name.toLowerCase().includes('a100'))).toBe(true);
  });

  it('returns empty array when no listing matches', () => {
    const result = filterListings(mockListings, { region: 'mars-north' });
    expect(result).toEqual([]);
  });

  it('combines multiple filters (AND)', () => {
    const result = filterListings(mockListings, {
      region: 'us-east',
      memoryMin: 40,
      status: 'available',
    });
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toEqual(['gpu-001', 'gpu-002']);
  });
});

describe('sortListings', () => {
  it('sorts by tFlops ascending', () => {
    const result = sortListings(mockListings, 'tFlops', 'asc');
    expect(result[0].tFlops).toBe(125);
    expect(result[result.length - 1].tFlops).toBe(989);
  });

  it('sorts by price descending', () => {
    const result = sortListings(mockListings, 'price', 'desc');
    expect(result[0].price).toBe(18000);
    expect(result[result.length - 1].price).toBe(5000);
  });

  it('sorts by memory ascending', () => {
    const result = sortListings(mockListings, 'memory', 'asc');
    expect(result[0].memory).toBe(32);
    expect(result[result.length - 1].memory).toBe(80);
  });

  it('sorts by utilization descending', () => {
    const result = sortListings(mockListings, 'utilization', 'desc');
    expect(result[0].utilization).toBe(90);
    expect(result[result.length - 1].utilization).toBe(30);
  });

  it('does not mutate the input array', () => {
    const original = [...mockListings];
    sortListings(mockListings, 'price', 'desc');
    expect(mockListings).toEqual(original);
  });
});

describe('queryListings (combined multi-criteria)', () => {
  it('region + memory range + sort by TFLOPS returns correct ordered subset', () => {
    const result = queryListings(
      mockListings,
      { region: 'us-east', memoryMin: 40, memoryMax: 80 },
      'tFlops',
      'desc',
    );
    // us-east listings with memory 40-80: gpu-001 (80GB, 312), gpu-002 (80GB, 989)
    // sorted by tFlops desc: gpu-002 (989), gpu-001 (312)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('gpu-002');
    expect(result[1].id).toBe('gpu-001');
  });

  it('returns empty array when no listing matches the combined criteria', () => {
    const result = queryListings(
      mockListings,
      { region: 'mars-north', memoryMin: 100 },
      'tFlops',
      'asc',
    );
    expect(result).toEqual([]);
  });

  it('search + status + sort by price returns correct ordered subset', () => {
    const result = queryListings(
      mockListings,
      { search: 'a100', status: 'available' },
      'price',
      'asc',
    );
    // A100 available: gpu-001 (12000), gpu-006 (11000)
    // sorted by price asc: gpu-006 (11000), gpu-001 (12000)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('gpu-006');
    expect(result[1].id).toBe('gpu-001');
  });
});
