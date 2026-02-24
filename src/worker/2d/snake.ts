function pop<T = any>(arr: T[], index: number): T {
  return arr.splice(index, 1)[0]
}

function getNeighbors(pos: number, stride: number): number[] {
  const neighbors: number[] = []

  // Left
  if (pos % stride && pos - 1 >= 0) neighbors.push(pos - 1)
  // Up
  if (pos - stride >= 0) neighbors.push(pos - stride)

  return neighbors
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

    let bestIndex = 0
    let bestDist = Infinity

    for (let i = 0; i < remaining.length; i++) {
      let d = 0

      for (const n of neighbors) {
        d += distMatrix[path[n]][remaining[i]]
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
