function pop<T = any>(arr: T[], index: number): T {
  return arr.splice(index, 1)[0]
}

self.onmessage = function (e) {
  const {
    N,
    stride,
    distMatrix,
    startIndex = 0,
  } = e.data as {
    N: number
    stride: number
    distMatrix: number[][]
    startIndex: number
  }

  const N_Sqrt = Math.sqrt(N)

  function getNeighbors(pos: number): Set<number> {
    const neighbors = new Set<number>()
    const col = pos % stride
    const row = Math.floor(pos / stride)
    const maxRow = Math.floor((N - 1) / stride)

    // Left
    if (col > 0) neighbors.add(pos - 1)
    // Right
    if (col < stride - 1 && pos + 1 < N) neighbors.add(pos + 1)
    // Up
    if (row > 0) neighbors.add(pos - stride)
    // Down
    if (row < maxRow && pos + stride < N) neighbors.add(pos + stride)

    return neighbors
  }

  const remaining = Array(N)
    .fill(0)
    .map((_, i) => i)

  const path: number[] = Array(N)

  const centerPos = ~~((N + N_Sqrt) / 2)
  path[centerPos] = pop(remaining, startIndex)
  const placed = new Set<number>([centerPos])

  const getSmartDist = (pos: number, distRow: number[]): number => {
    const placedNeighbors = getNeighbors(pos).intersection(placed)
    let d = 0
    for (const n of placedNeighbors) d += distRow[path[n]]
    return d / placedNeighbors.size ** 2
  }

  let neighborsOfPlaced = new Set<number>()
  let bestPos = 0

  while (remaining.length) {
    for (const n of getNeighbors(bestPos)) {
      if (!placed.has(n)) neighborsOfPlaced.add(n)
    }

    let bestIndex = 0
    let bestDist = Infinity

    for (let i = 0; i < remaining.length; i++) {
      const distRow = distMatrix[remaining[i]]

      let visitCount = 0

      for (const n of neighborsOfPlaced) {
        const d = getSmartDist(n, distRow)

        if (d < bestDist) {
          bestDist = d
          bestIndex = i
          bestPos = n
        }

        // Prevent heavy loops with many swatches
        if (++visitCount > N_Sqrt / 2) break
      }
    }

    path[bestPos] = pop(remaining, bestIndex)
    placed.add(bestPos)
    neighborsOfPlaced.delete(bestPos)
  }

  self.postMessage(path)
}
