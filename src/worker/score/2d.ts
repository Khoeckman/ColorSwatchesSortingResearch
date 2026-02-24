function getNeighbors(pos: number, stride: number): number[] {
  const neighbors: number[] = []

  // Left
  if (pos % stride && pos - 1 >= 0) neighbors.push(pos - 1)
  // Up
  if (pos - stride >= 0) neighbors.push(pos - stride)

  return neighbors
}

self.onmessage = function (e) {
  const { N, distMatrix, stride, power } = e.data as {
    N: number
    distMatrix: number[][]
    stride: number
    power: number
  }

  if (N <= 1) return 0

  // Step 1: compute actual penalty (sum of distances to adjacent neighbors in 2D)
  let actualPenalty = 0

  for (let i = 0; i < N; i++) {
    const neighbors = getNeighbors(i, stride)

    for (const n of neighbors) {
      actualPenalty += distMatrix[i][n]
    }
  }

  // Step 2: compute guaranteed lower bound (closest neighbor sum)
  let lowerBound = 0

  for (let i = 0; i < N; i++) {
    let minDist = Infinity

    for (let j = 0; j < N; j++) {
      if (i === j) continue
      const d = distMatrix[i][j]
      if (d < minDist) minDist = d
    }
    lowerBound += minDist
  }

  // Step 3: approximate worst-case (max jump for each neighbor relationship)
  const maxStep = Math.pow(128, power) // max CIEDE2000 distance
  const rows = Math.ceil(N / stride)

  // Count total neighbor relationships: horizontal + vertical edges
  const horizontalEdges = rows * (stride - 1) - Math.max(0, stride - (N % stride || stride))
  const verticalEdges = (rows - 1) * stride
  const totalEdges = horizontalEdges + verticalEdges
  const worstPenalty = maxStep * totalEdges

  // Step 4: normalize
  const normalized = (actualPenalty - lowerBound) / (worstPenalty - lowerBound)

  self.postMessage(Math.max(0, Math.min(1, normalized)))
}
