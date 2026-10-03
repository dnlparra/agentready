export type DayHours = { open: string; close: string } | null;
export type WeeklyHours = Partial<Record<DayName, DayHours>>;
export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
export type DayName = (typeof DAYS)[number];

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Current local date (YYYY-MM-DD), time (HH:MM) and weekday in a timezone. */
export function nowIn(timeZone = "America/Monterrey") {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "long",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    day: parts.weekday.toLowerCase() as DayName,
  };
}

export function dayOf(date: string): DayName {
  return DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
}

function prevDay(day: DayName): DayName {
  return DAYS[(DAYS.indexOf(day) + 6) % 7];
}

/** Is the business open on `day` at `time`? Handles past-midnight closing (close < open). */
export function isOpenAt(hours: WeeklyHours, day: DayName, time: string): boolean {
  const t = toMin(time);
  const today = hours[day];
  if (today) {
    const o = toMin(today.open), c = toMin(today.close);
    if (c > o ? t >= o && t < c : t >= o) return true;
  }
  // Spill-over from yesterday's late-night shift (e.g. Fri 08:00–03:00 covers Sat 01:00)
  const y = hours[prevDay(day)];
  if (y) {
    const o = toMin(y.open), c = toMin(y.close);
    if (c < o && t < c) return true;
  }
  return false;
}

export function isOpenNow(hours: WeeklyHours, timeZone = "America/Monterrey"): boolean {
  const n = nowIn(timeZone);
  return isOpenAt(hours, n.day, n.time);
}

export function hoursLabel(h: DayHours | undefined): string {
  return h ? `${h.open}–${h.close}` : "closed";
}
