export type DateLike = string | Date;

/**
 * Convert a JS Date's getDay() value (0-6 with Sun=0) to a Monday-first index (0 => Mon, 6 => Sun)
 */
export function mondayFirstDayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/**
 * Aggregate values from records into an array of seven numbers, indexed Mon..Sun.
 * Accepts a getDate function and a getValue function to extract date and numeric value.
 */
export function aggregateByWeekday<T>(items: T[], getDate: (it: T) => DateLike | undefined, getValue: (it: T) => number | undefined) {
  const out = new Array(7).fill(0);
  if (!items || !items.length) {
    return out;
  }
  items.forEach((it) => {
    const ds = getDate(it);
    if (!ds) {
      return;
    }
    const date = typeof ds === 'string' ? new Date(ds) : ds;
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const idx = mondayFirstDayIndex(date);
    out[idx] = (out[idx] || 0) + (Number(getValue(it)) || 0);
  });
  return out;
}

export default { mondayFirstDayIndex, aggregateByWeekday };
