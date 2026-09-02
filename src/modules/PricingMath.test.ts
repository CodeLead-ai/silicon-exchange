import { describe, it, expect } from 'vitest';
import { calculatePrice } from './PricingMath';

describe('calculatePrice', () => {
  describe('15-minute round-up', () => {
    it('rounds 70 minutes up to 75 minutes', () => {
      // 70 → ceil(70/15)*15 = 75; 75 min at 1000¢/hr = (75/60)*1000 = 1250
      expect(calculatePrice(70, 1000)).toBe(1250);
    });

    it('rounds 61 minutes up to 75 minutes', () => {
      // 61 → ceil(61/15)*15 = 75; 75 min at 1000¢/hr = 1250
      expect(calculatePrice(61, 1000)).toBe(1250);
    });

    it('does not round if already a multiple of 15', () => {
      // 90 is already a multiple of 15; 90 min at 1000¢/hr = 1500
      expect(calculatePrice(90, 1000)).toBe(1500);
    });

    it('rounds 1 minute up to 15 minutes (then minimum applies)', () => {
      // 1 → ceil(1/15)*15 = 15 → max(15,60) = 60; 60 min at 2000¢/hr = 2000
      expect(calculatePrice(1, 2000)).toBe(2000);
    });
  });

  describe('1-hour minimum', () => {
    it('bills a 10-minute reservation as 1 hour', () => {
      // 10 → ceil(10/15)*15 = 15 → max(15,60) = 60; 60 min at 1000¢/hr = 1000
      expect(calculatePrice(10, 1000)).toBe(1000);
    });

    it('bills a 30-minute reservation as 1 hour', () => {
      // 30 → ceil(30/15)*15 = 30 → max(30,60) = 60; 60 min at 500¢/hr = 500
      expect(calculatePrice(30, 500)).toBe(500);
    });

    it('bills exactly 60 minutes as 1 hour (no change)', () => {
      // 60 → ceil(60/15)*15 = 60 → max(60,60) = 60; 60 min at 1000¢/hr = 1000
      expect(calculatePrice(60, 1000)).toBe(1000);
    });

    it('does not apply minimum to durations already above 60 minutes', () => {
      // 90 → ceil(90/15)*15 = 90 → max(90,60) = 90; 90 min at 1000¢/hr = 1500
      expect(calculatePrice(90, 1000)).toBe(1500);
    });
  });

  describe('over-24h discount (10% off, proportional)', () => {
    it('applies no discount for exactly 24 hours', () => {
      // 1440 → ceil(1440/15)*15 = 1440 → max(1440,60) = 1440
      // 1440 min at 1000¢/hr = 24000
      expect(calculatePrice(1440, 1000)).toBe(24000);
    });

    it('applies 10% off only the 25th hour for a 25-hour reservation', () => {
      // 1500 → ceil(1500/15)*15 = 1500 → max(1500,60) = 1500
      // First 1440 min: 24 * 1000 = 24000
      // Remaining 60 min: (60/60) * 1000 * 0.9 = 900
      // Total: 24900
      expect(calculatePrice(1500, 1000)).toBe(24900);
    });

    it('applies proportional discount for fractional hours beyond 24', () => {
      // 1455 min (24h 15m) → ceil(1455/15)*15 = 1455 → max(1455,60) = 1455
      // First 1440 min: 24 * 1000 = 24000
      // Remaining 15 min: (15/60) * 1000 * 0.9 = 225
      // Total: 24225
      expect(calculatePrice(1455, 1000)).toBe(24225);
    });

    it('rounds up to next 15-min before applying discount', () => {
      // 1441 min → ceil(1441/15)*15 = 1455 → max(1455,60) = 1455
      // First 1440 min: 24 * 1000 = 24000
      // Remaining 15 min: (15/60) * 1000 * 0.9 = 225
      // Total: 24225
      expect(calculatePrice(1441, 1000)).toBe(24225);
    });

    it('handles a 48-hour reservation with discount on hours 25-48', () => {
      // 2880 min → ceil(2880/15)*15 = 2880 → max(2880,60) = 2880
      // First 1440 min: 24 * 1000 = 24000
      // Remaining 1440 min: (1440/60) * 1000 * 0.9 = 21600
      // Total: 45600
      expect(calculatePrice(2880, 1000)).toBe(45600);
    });

    it('returns integer cents for rates that produce fractional results', () => {
      // 1455 min at 333¢/hr
      // First 1440: 24 * 333 = 7992
      // Remaining 15: (15/60) * 333 * 0.9 = 74.925
      // Total: Math.round(7992 + 74.925) = Math.round(8066.925) = 8067
      expect(calculatePrice(1455, 333)).toBe(8067);
    });
  });
});
