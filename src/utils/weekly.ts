export type DateLike = string | Date;

/**
 * Convert a JS Date's getDay() value (0-6 with Sun=0) to a Monday-first index (0 => Mon, 6 => Sun)
 */
export function mondayFirstDayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/**
 * Aggregate values from records into an array of seven numbers, indexed Mon..Sun.
 * Only items from the current week (Monday..Sunday) are included.
 * Accepts a getDate function and a getValue function to extract date and numeric value.
 * Optionally pass `referenceDate` to define "this week" (useful for tests).
 */
export function aggregateByWeekday<T>(
  items: T[],
  getDate: (it: T) => DateLike | undefined,
  getValue: (it: T) => number | undefined,
  referenceDate?: Date
) {
  const out = new Array(7).fill(0);
  if (!items || !items.length) {
    return out;
  }
  // Determine start (Monday 00:00:00) of the reference week (defaults to now)
  const ref = referenceDate ?? new Date();
  const mondayIdx = mondayFirstDayIndex(ref);
  const weekStart = new Date(ref);
  weekStart.setDate(ref.getDate() - mondayIdx);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartTime = weekStart.getTime();
  const weekEndTime = weekStartTime + 7 * 24 * 60 * 60 * 1000; // exclusive
  items.forEach((it) => {
    const ds = getDate(it);
    if (!ds) {
      return;
    }
    const date = typeof ds === 'string' ? new Date(ds) : ds;
    if (Number.isNaN(date.getTime())) {
      return;
    }
    // Only include entries that fall inside the current week (Mon..Sun)
    const t = date.getTime();
    if (t < weekStartTime || t >= weekEndTime) {
      return;
    }
    const idx = mondayFirstDayIndex(date);
    out[idx] = (out[idx] || 0) + (Number(getValue(it)) || 0);
  });
  return out;
}

// prefer named exports — no default export here
