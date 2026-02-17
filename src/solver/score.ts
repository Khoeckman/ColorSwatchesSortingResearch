import convert from 'color-convert'
import type { RGB, LAB } from 'color-convert'
import { getDeltaE_CIEDE2000 } from 'deltae-js'

const dist = (a: RGB, b: RGB) => {
  const x1: LAB = convert.rgb.lab.raw(a)
  const x2: LAB = convert.rgb.lab.raw(b)
  return getDeltaE_CIEDE2000(x1, x2)
}

export function scoreSwatchLine(path: RGB[], power = 1): number {
  const n = path.length
  if (n <= 1) return 0

  // Step 1: compute actual path penalty
  let actualPenalty = 0

  for (let i = 1; i < n; i++) {
    actualPenalty += Math.pow(dist(path[i - 1], path[i]), power)
  }

  // Step 2: compute guaranteed lower bound (closest neighbor sum)
  let lowerBound = 0

  for (let i = 0; i < n; i++) {
    let minDist = Infinity

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d = dist(path[i], path[j])
      if (d < minDist) minDist = d
    }
    lowerBound += Math.pow(minDist, power)
  }

  // Step 3: approximate worst-case (max jump every step)
  const maxStep = 128 // max CIEDE2000 distance
  const worstPenalty = Math.pow(maxStep, power) * (n - 1)

  // Step 4: normalize
  const normalized = (actualPenalty - lowerBound) / (worstPenalty - lowerBound)
  return Math.max(0, Math.min(1, normalized))
}

export function scoreSwatchPlane(path: RGB[], stride: number, power = 1): number {
  const n = path.length
  if (n <= 1) return 0

  const getNeighbors = (index: number): number[] => {
    const neighbors: number[] = []

    // Right
    if (index % stride < stride - 1 && index + 1 < n) {
      neighbors.push(index + 1)
    }

    // Down
    if (index + stride < n) {
      neighbors.push(index + stride)
    }

    return neighbors
  }

  // Step 1: compute actual penalty (sum of distances to adjacent neighbors in 2D)
  let actualPenalty = 0

  for (let i = 0; i < n; i++) {
    const neighbors = getNeighbors(i)

    for (const j of neighbors) {
      actualPenalty += Math.pow(dist(path[i], path[j]), power)
    }
  }

  // Step 2: compute guaranteed lower bound (closest neighbor sum)
  let lowerBound = 0

  for (let i = 0; i < n; i++) {
    let minDist = Infinity

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d = dist(path[i], path[j])
      if (d < minDist) minDist = d
    }
    lowerBound += Math.pow(minDist, power)
  }

  // Step 3: approximate worst-case (max jump for each neighbor relationship)
  const maxStep = 128 // max CIEDE2000 distance
  const rows = Math.ceil(n / stride)

  // Count total neighbor relationships: horizontal + vertical edges
  const horizontalEdges = rows * (stride - 1) - Math.max(0, stride - (n % stride || stride))
  const verticalEdges = (rows - 1) * stride
  const totalEdges = horizontalEdges + verticalEdges
  const worstPenalty = Math.pow(maxStep, power) * totalEdges

  // Step 4: normalize
  const normalized = (actualPenalty - lowerBound) / (worstPenalty - lowerBound)
  return Math.max(0, Math.min(1, normalized))
}
