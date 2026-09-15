export type CalendarPeriod = "day" | "week" | "month" | "year";

export const DEFAULT_CENTER_UTC_OFFSET_MINUTES = 8 * 60;

export function getCenterUtcOffsetMinutes() {
  const configured = Number(process.env.MOBI_CENTER_UTC_OFFSET_MINUTES);

  return Number.isInteger(configured) &&
    configured >= -12 * 60 &&
    configured <= 14 * 60
    ? configured
    : DEFAULT_CENTER_UTC_OFFSET_MINUTES;
}

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      "Progress anchor date must use YYYY-MM-DD format.",
    );
  }

  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error("Invalid progress anchor date.");
  }

  return { year, month, day };
}

function getLocalDateParts(now: Date, utcOffsetMinutes: number) {
  const shifted = new Date(
    now.getTime() + utcOffsetMinutes * 60_000,
  );

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function localMidnightToUtc(
  year: number,
  month: number,
  day: number,
  utcOffsetMinutes: number,
) {
  return new Date(
    Date.UTC(year, month - 1, day) -
      utcOffsetMinutes * 60_000,
  );
}

export function getUtcStartOfCenterDay(
  now: Date,
  utcOffsetMinutes = getCenterUtcOffsetMinutes(),
) {
  const { year, month, day } = getLocalDateParts(
    now,
    utcOffsetMinutes,
  );

  return localMidnightToUtc(
    year,
    month,
    day,
    utcOffsetMinutes,
  );
}

export function getCenterDateRange(
  period: CalendarPeriod,
  anchorDate?: string,
  now = new Date(),
  utcOffsetMinutes = getCenterUtcOffsetMinutes(),
) {
  const parts = anchorDate
    ? parseDateOnly(anchorDate)
    : getLocalDateParts(now, utcOffsetMinutes);
  const calendarStart = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  );

  if (period === "week") {
    const dayOfWeek = calendarStart.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    calendarStart.setUTCDate(
      calendarStart.getUTCDate() - daysFromMonday,
    );
  } else if (period === "month") {
    calendarStart.setUTCDate(1);
  } else if (period === "year") {
    calendarStart.setUTCMonth(0, 1);
  }

  const nextCalendarStart = new Date(calendarStart);

  if (period === "day") {
    nextCalendarStart.setUTCDate(
      nextCalendarStart.getUTCDate() + 1,
    );
  } else if (period === "week") {
    nextCalendarStart.setUTCDate(
      nextCalendarStart.getUTCDate() + 7,
    );
  } else if (period === "month") {
    nextCalendarStart.setUTCMonth(
      nextCalendarStart.getUTCMonth() + 1,
      1,
    );
  } else {
    nextCalendarStart.setUTCFullYear(
      nextCalendarStart.getUTCFullYear() + 1,
      0,
      1,
    );
  }

  const start = new Date(
    calendarStart.getTime() - utcOffsetMinutes * 60_000,
  );
  const end = new Date(
    nextCalendarStart.getTime() -
      utcOffsetMinutes * 60_000 -
      1,
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
