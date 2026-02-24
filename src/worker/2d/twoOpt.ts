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
  const { N, stride, path, distMatrix, maxImprovements } = e.data as {
    N: number
    stride: number
    path: number[]
    distMatrix: number[][]
    maxImprovements: number
  }

  function getNeighborDist(pos: number): number {
    let sum = 0
    for (const n of neighbors[pos]) sum += distMatrix[path[pos]][path[n]]
    return sum
  }

  // Cache neighbors
  const neighbors: number[][] = []

  for (let n = 0; n < N; n++) {
    neighbors[n] = getNeighbors(n, stride, N)
  }

  let improved = true
  let improvements = 0

  while (improved && improvements < maxImprovements) {
    improved = false

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const affected = new Set([...neighbors[i], ...neighbors[j], i, j])

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
