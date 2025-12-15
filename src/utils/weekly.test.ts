import { describe, expect, it } from 'vitest';
import { aggregateByWeekday, mondayFirstDayIndex } from './weekly';

describe('aggregateByWeekday', () => {
  it('aggregates values from dates into Mon..Sun order', () => {
    const items = [
      { date: '2025-12-08T10:00:00', v: 1 }, // Mon
      { date: '2025-12-09T11:00:00', v: 2 }, // Tue
      { date: '2025-12-10T12:00:00', v: 3 }, // Wed
      { date: '2025-12-14T09:00:00', v: 4 }, // Sun
    ];
    const arr = aggregateByWeekday(
      items,
      (it) => it.date,
      (it) => it.v,
      new Date('2025-12-10') // use a date within the Mon..Sun week to make test deterministic
    );
    // Expect length 7 and values at correct offsets (Mon=0..Sun=6)
    expect(arr).toHaveLength(7);
    expect(arr[0]).toBe(1); // Monday
    expect(arr[1]).toBe(2); // Tuesday
    expect(arr[2]).toBe(3); // Wednesday
    expect(arr[6]).toBe(4); // Sunday
  });

  it('ignores dates outside the reference week', () => {
    const items = [
      { date: '2025-12-08T10:00:00', v: 1 }, // in-week
      { date: '2025-11-30T10:00:00', v: 99 }, // previous week
    ];
    const arr = aggregateByWeekday(
      items,
      (it) => it.date,
      (it) => it.v,
      new Date('2025-12-10')
    );
    expect(arr.reduce((s, v) => s + v, 0)).toBe(1);
  });
});

describe('mondayFirstDayIndex', () => {
  it('computes Monday-first indices for dates through the week', () => {
    const mon = new Date('2025-12-08');
    const tue = new Date('2025-12-09');
    const sun = new Date('2025-12-14');
    expect(mondayFirstDayIndex(mon)).toBe(0);
    expect(mondayFirstDayIndex(tue)).toBe(1);
    expect(mondayFirstDayIndex(sun)).toBe(6);
  });
});
