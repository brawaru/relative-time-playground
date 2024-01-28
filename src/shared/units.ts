export const units: Record<Intl.RelativeTimeFormatUnitSingular, string> = {
  year: "Year",
  quarter: "Quarter",
  month: "Month",
  week: "Week",
  day: "Day",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
};

export function isUnit(
  value: unknown
): value is Intl.RelativeTimeFormatUnitSingular {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(units, value)
  );
}
