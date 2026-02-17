self.onmessage = function (e) {
  const { N, stride, path, distMatrix } = e.data

  function getNeighbors(pos: number): number[] {
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

  function calculateTotalDist(): number {
    let sum = 0

    for (let i = 0; i < N; i++) {
      const neighbors = getNeighbors(i)

      for (const j of neighbors) {
        sum += distMatrix[path[i]][path[j]]
      }
    }
    return sum
  }

  let improved = true
  let improvements = 0
  let maxImprovements = N * 2

  while (improved && improvements < maxImprovements) {
    improved = false

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const currentDist = calculateTotalDist()

        // Swap values at positions i and j
        const temp = path[i]
        path[i] = path[j]
        path[j] = temp

        const newDist = calculateTotalDist()

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
