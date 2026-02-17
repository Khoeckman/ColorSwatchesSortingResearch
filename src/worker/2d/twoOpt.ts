function getNeighbors(pos: number, stride: number, N: number): number[] {
  const neighbors = []
  const col = pos % stride
  const row = Math.floor(pos / stride)
  const maxRow = Math.floor((N - 1) / stride)

  // Left
  if (col > 0) neighbors.push(pos - 1)
  // Right
  if (col < stride - 1 && pos + 1 < N) neighbors.push(pos + 1)
  // Up
  if (row > 0) neighbors.push(pos - stride)
  // Down
  if (row < maxRow && pos + stride < N) neighbors.push(pos + stride)

  return neighbors
}

self.onmessage = function (e) {
  const { N, stride, path, distMatrix, maxImprovements } = e.data

  function getNeighborDist(pos: number): number {
    const neighbors = getNeighbors(pos, stride, N)

    let sum = 0

    for (const n of neighbors) {
      sum += distMatrix[path[pos]][path[n]]
    }
    return sum
  }

  let improved = true
  let improvements = 0

  while (improved && improvements < maxImprovements) {
    improved = false

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const affected = new Set([...getNeighbors(i, stride, N), ...getNeighbors(j, stride, N), i, j])

        let currentSum = 0
        for (const k of affected)
          currentSum += getNeighborDist(k)

          // Swap values at positions i and j
        ;[path[i], path[j]] = [path[j], path[i]]

        let newSum = 0
        for (const k of affected) newSum += getNeighborDist(k)

        if (newSum < currentSum) {
          improved = true
          improvements++
        } else {
          // Swap back if sum is worse
          ;[path[i], path[j]] = [path[j], path[i]]
        }
      }
    }
  }

  self.postMessage(path)
}
