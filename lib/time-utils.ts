// Time utilities for the application.

const IST_TIME_ZONE = "Asia/Kolkata";

function formatClockTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;

  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseTimeParts(timeString: string) {
  const trimmed = timeString.trim();
  const twelveHourMatch = trimmed.match(
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/
  );

  if (twelveHourMatch) {
    const hours = Number(twelveHourMatch[1]) % 12;
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();
    const normalizedHours = period === "PM" ? hours + 12 : hours;

    return { hours: normalizedHours, minutes };
  }

  const twentyFourHourMatch = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2]),
    };
  }

  return null;
}

export function formatTime(date: Date | string): string {
  if (typeof date === "string") {
    const parsed = parseTimeParts(date);

    if (parsed) {
      return formatClockTime(parsed.hours, parsed.minutes);
    }
  }

  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatTime24HourIST(date: Date | string): string {
  if (typeof date === "string") {
    const parsed = parseTimeParts(date);

    if (parsed) {
      return `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`;
    }
  }

  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).format(d);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function parseTime(timeString: string): Date | null {
  const parsed = parseTimeParts(timeString);
  if (!parsed) return null;

  const date = new Date();
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return date;
}

export function isValidTime(timeString: string): boolean {
  return parseTime(timeString) !== null;
}

export function isTimeInRange(time: Date, start: Date, end: Date): boolean {
  const timeMinutes = time.getHours() * 60 + time.getMinutes();
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

export function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesToTime(minutes: number): Date {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}
