self.onmessage = function (e) {
  const { N, distMatrix, power } = e.data as {
    N: number
    distMatrix: number[][]
    power: number
  }

  if (N <= 1) return 0

  // Step 1: compute actual path penalty
  let actualPenalty = 0

  for (let i = 1; i < N; i++) {
    actualPenalty += distMatrix[i - 1][i]
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

  // Step 3: approximate worst-case (max jump every step)
  const maxStep = Math.pow(128, power) // max CIEDE2000 distance
  const worstPenalty = maxStep * (N - 1)

  // Step 4: normalize
  const normalized = (actualPenalty - lowerBound) / (worstPenalty - lowerBound)

  self.postMessage(Math.max(0, Math.min(1, normalized)))
}
