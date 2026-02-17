function pop<T = any>(arr: T[], index: number): T {
  return arr.splice(index, 1)[0]
}

function getNeighbors(pos: number, stride: number, N: number): Set<number> {
  const neighbors = new Set<number>()
  const col = pos % stride
  const row = Math.floor(pos / stride)
  const maxRow = Math.floor((N - 1) / stride)

  // left
  if (col > 0) neighbors.add(pos - 1)
  // right
  if (col < stride - 1 && pos + 1 < N) neighbors.add(pos + 1)
  // up
  if (row > 0) neighbors.add(pos - stride)
  // down
  if (row < maxRow && pos + stride < N) neighbors.add(pos + stride)

  return neighbors
}

self.onmessage = function (e) {
  const { N, stride, distMatrix, startIndex = 0 } = e.data

  const remaining = Array(N)
    .fill(0)
    .map((_, i) => i)

  const path: number[] = [pop(remaining, startIndex)]
  const placed = new Set<number>([startIndex])

  const getSmartDist = (pos: number, distRow: number[]): number => {
    const placedNeighbors = getNeighbors(pos, stride, N).intersection(placed)
    let d = 0

    console.log('pn', placedNeighbors)

    for (const n of placedNeighbors) {
      d += distRow[path[n]]
    }
    return d / placedNeighbors.size ** 2
  }

  let neighborsOfPlaced = new Set<number>()
  let bestPos = 0

  let iter = 0
  while (remaining.length && iter < 1000) {
    iter++

    for (const n of getNeighbors(bestPos, stride, N)) {
      if (!placed.has(n)) neighborsOfPlaced.add(n)
    }
    // neighborsOfPlaced.difference(placed)

    console.log('nop', neighborsOfPlaced, placed)

    let bestIndex = 0
    bestPos = [...neighborsOfPlaced][0]
    let bestDist = Infinity

    console.log('before loop', remaining, neighborsOfPlaced)

    for (let i = 0; i < remaining.length; i++) {
      const distRow = distMatrix[remaining[i]]

      for (const n of neighborsOfPlaced) {
        console.log('n', n)
        const d = getSmartDist(n, distRow)

        if (d < bestDist) {
          console.log('BEST FOUND', ~~d, i, n)
          bestDist = d
          bestIndex = i
          bestPos = n
        }
      }
    }

    path[bestPos] = pop(remaining, bestIndex)
    placed.add(bestPos)
    neighborsOfPlaced.delete(bestPos)
  }

  self.postMessage(path)
}
