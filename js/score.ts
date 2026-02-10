type RGB = [number, number, number]

export function colorPunishmentScore(colors: RGB[], power = 2.5): number {
  const n = colors.length
  if (n <= 1) return 0

  const dist = (a: RGB, b: RGB) => {
    const dr = a[0] - b[0]
    const dg = a[1] - b[1]
    const db = a[2] - b[2]
    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  const pathPenalty = (arr: RGB[]) => {
    let sum = 0

    for (let i = 1; i < arr.length; i++) {
      const d = dist(arr[i - 1], arr[i])
      sum += Math.pow(d, power)
    }
    return sum
  }

  const worstApprox = 1e8
  const bestApprox = 1e6

  const actual = pathPenalty(colors)

  const normalized = (actual - bestApprox) / (worstApprox - bestApprox)
  return Math.max(0, Math.min(1, normalized))
}
