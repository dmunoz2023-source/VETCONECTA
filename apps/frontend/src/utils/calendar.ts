export const CALENDAR_WEEK_DAYS = ["D", "L", "M", "M", "J", "V", "S"];

const MONTH_FORMAT = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" });

export const formatMonthYear = (date: Date): string => {
  const text = MONTH_FORMAT.format(date).replace(" de ", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getMonthGrid = (year: number, month: number) => ({
  offset: new Date(year, month, 1).getDay(),
  daysInMonth: new Date(year, month + 1, 0).getDate(),
});
