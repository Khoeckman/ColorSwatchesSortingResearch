function pop<T = any>(arr: T[], index: number): T {
  return arr.splice(index, 1)[0]
}

function getNeighbors(index: number, stride: number): number[] {
  const neighbors: number[] = []

  // Left
  if (index % stride && index - 1 >= 0) {
    neighbors.push(index - 1)
  }

  // Up
  if (index - stride >= 0) {
    neighbors.push(index - stride)
  }

  return neighbors
}

self.onmessage = function (e) {
  const { N, stride, distMatrix, startIndex = 0 } = e.data

  const remaining = Array(N)
    .fill(0)
    .map((_, i) => i)

  const path: number[] = [pop(remaining, startIndex)]

  while (remaining.length) {
    const neighbors = getNeighbors(path.length, stride)

    if (!neighbors.length) {
      path.push(pop(remaining, 0))
      continue
    }

    const distRows = []

    for (const j of neighbors) {
      distRows.push(distMatrix[path[j]])
    }

    let bestIndex = 0
    let bestDist = Infinity

    for (let i = 0; i < remaining.length; i++) {
      let d = 0

      for (const distRow of distRows) {
        d += distRow[remaining[i]]
      }

      if (d < bestDist) {
        bestDist = d
        bestIndex = i
      }
    }
    path.push(pop(remaining, bestIndex))
  }
  self.postMessage(path)
}
