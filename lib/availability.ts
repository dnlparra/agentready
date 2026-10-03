import { supabaseAdmin } from "@/lib/supabase";
import { dayOf, hoursLabel, isOpenAt, nowIn, DAYS, type WeeklyHours } from "@/lib/hours";

export type AvailabilityStatus = "available" | "likely_available" | "limited" | "full" | "closed" | "too_large" | "in_the_past";

type Biz = {
  id: string; hours: WeeklyHours; timezone: string; has_agent: boolean;
  capacity: number; max_party_size: number;
};

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/**
 * Availability = opening hours + capacity minus reservations already booked
 * within ±60 min of the requested slot (stored in Supabase `reservations`).
 */
export async function computeAvailability(b: Biz, date: string, time: string, partySize = 1) {
  const day = dayOf(date);
  const now = nowIn(b.timezone);
  const base = { date, time, day, hours_that_day: hoursLabel(b.hours[day]) };

  if (date < now.date || (date === now.date && time < now.time)) {
    return { ...base, status: "in_the_past" as AvailabilityStatus, message: `That time has passed (local time is ${now.date} ${now.time}).` };
  }
  if (!isOpenAt(b.hours, day, time)) {
    return { ...base, status: "closed" as AvailabilityStatus, message: `Closed at ${time} on ${day}.`, alternatives: nextOpenings(b.hours, date) };
  }
  if (partySize > b.max_party_size) {
    return { ...base, status: "too_large" as AvailabilityStatus, message: `Max party size is ${b.max_party_size}. Contact the business for larger groups.` };
  }
  if (!b.has_agent || b.capacity <= 0) {
    return { ...base, status: "likely_available" as AvailabilityStatus, message: "Open at that time. Live availability not available for this business (no agent); confirm by phone." };
  }

  const { data } = await supabaseAdmin()
    .from("reservations")
    .select("time, party_size")
    .eq("business_id", b.id)
    .eq("date", date)
    .eq("status", "confirmed");
  const booked = (data ?? [])
    .filter((r) => r.time && Math.abs(toMin(r.time) - toMin(time)) < 60)
    .reduce((sum, r) => sum + (r.party_size ?? 1), 0);
  const remaining = b.capacity - booked;

  if (remaining < partySize) {
    return { ...base, status: "full" as AvailabilityStatus, remaining_capacity: Math.max(remaining, 0), message: "Fully booked around that time. Try ±1 hour." };
  }
  return {
    ...base,
    status: (remaining - partySize < b.capacity * 0.2 ? "limited" : "available") as AvailabilityStatus,
    remaining_capacity: remaining,
    message: "Available. Book it with contact_agent (action make_reservation or book_appointment).",
  };
}

function nextOpenings(hours: WeeklyHours, fromDate: string) {
  const start = DAYS.indexOf(dayOf(fromDate));
  const out: { day: string; hours: string }[] = [];
  for (let i = 0; i < 7 && out.length < 3; i++) {
    const d = DAYS[(start + i) % 7];
    if (hours[d]) out.push({ day: d, hours: hoursLabel(hours[d]) });
  }
  return out;
}
