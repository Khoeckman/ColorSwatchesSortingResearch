function getNeighbors(index: number, stride: number, N: number): number[] {
  const neighbors: number[] = []

  // Right
  if (index % stride < stride - 1 && index + 1 < N) {
    neighbors.push(index + 1)
  }

  // Down
  if (index + stride < N) {
    neighbors.push(index + stride)
  }

  return neighbors
}

function calculateTotalDist(path: number[], distMatrix: number[][], stride: number, N: number): number {
  let sum = 0
  for (let i = 0; i < N; i++) {
    const neighbors = getNeighbors(i, stride, N)

    for (const j of neighbors) {
      sum += distMatrix[path[i]][path[j]]
    }
  }
  return sum
}

self.onmessage = function (e) {
  const { N, stride, path, distMatrix } = e.data

  let improved = true
  let improvements = 0
  let maxImprovements = 10_000

  while (improved && improvements < maxImprovements) {
    improved = false

    // Try swapping adjacent cells in the grid
    for (let i = 0; i < N; i++) {
      const neighbors = getNeighbors(i, stride, N)

      for (const j of neighbors) {
        if (j <= i) continue // Only check each pair once

        const currentDist = calculateTotalDist(path, distMatrix, stride, N)

        // Swap values at positions i and j
        const temp = path[i]
        path[i] = path[j]
        path[j] = temp

        const newDist = calculateTotalDist(path, distMatrix, stride, N)

        if (newDist < currentDist) {
          improved = true
          improvements++
        } else {
          // Swap back if no improvement
          path[j] = path[i]
          path[i] = temp
        }
      }
    }
  }

  self.postMessage(path)
}
