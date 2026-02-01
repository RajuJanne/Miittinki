import { parseISO } from 'date-fns';

export function parseIsoToDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isStartBeforeEnd(start: Date, end: Date): boolean {
  return start.getTime() < end.getTime();
}

export function isInPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
}
