export function formatDateLong(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase()
}

export function formatDay(date: Date): string {
  return String(date.getDate()).padStart(2, "0")
}

export function formatMonthYear(date: Date): string {
  const m = date.toLocaleDateString("en-US", { month: "short" })
  const y = date.getFullYear().toString().slice(2)
  return `${m} '${y}`
}

export function formatYear(date: Date): string {
  return String(date.getFullYear())
}
