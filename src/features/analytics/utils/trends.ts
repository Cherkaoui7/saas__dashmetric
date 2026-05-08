export function getTrendDirection(start: number, end: number) {
  if (end > start) {
    return "up" as const
  }

  if (end < start) {
    return "down" as const
  }

  return "flat" as const
}

export function calculatePercentageChange(
  start: number,
  end: number
) {
  if (start === 0) {
    return null
  }

  return ((end - start) / start) * 100
}
