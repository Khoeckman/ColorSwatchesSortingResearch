self.onmessage = function (e) {
  const { N, path, distMatrix } = e.data

  let improved = true
  let improvements = 0
  let maxImprovements = N

  function reverseSegment(start: number, end: number) {
    while (start < end) {
      ;[path[start], path[end]] = [path[end], path[start]]
      start++
      end--
    }
  }

  while (improved && improvements < maxImprovements) {
    improved = false

    for (let i = 1; i < N - 2; i++) {
      for (let k = i + 1; k < N - 1; k++) {
        const a = path[i - 1]
        const b = path[i]
        const c = path[k]
        const d = path[k + 1]

        const currentDist = distMatrix[a][b] + distMatrix[c][d]
        const swappedDist = distMatrix[a][c] + distMatrix[b][d]

        if (swappedDist < currentDist) {
          reverseSegment(i, k)
          improved = true
          improvements++
        }
      }
    }
  }

  self.postMessage(path)
}
