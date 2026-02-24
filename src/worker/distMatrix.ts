import { distRGB, distLAB } from '../solver/deltaE'
import type { RGB } from 'color-convert'

self.onmessage = function (e) {
  const {
    N,
    values,
    power = 0,
    distFn = 'LAB',
  } = e.data as {
    N: number
    values: RGB[]
    power: number
    distFn: 'LAB' | 'RGB'
  }

  const distMatrix = Array(N)
    .fill(0)
    .map(() => Array(N).fill(0))

  if (distFn === 'RGB')
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const d = Math.pow(distRGB(values[i], values[j]), power) // 8 bit
        distMatrix[i][j] = d
        distMatrix[j][i] = d
      }
    }
  else {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const d = Math.pow(distLAB(values[i], values[j]), power) // 8 bit
        distMatrix[i][j] = d
        distMatrix[j][i] = d
      }
    }
  }

  self.postMessage(distMatrix)
}
