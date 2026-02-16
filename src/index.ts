import type { RGB } from 'color-convert'

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z * 6 + 3))

export const generateRandomRGB = (length: number): RGB[] =>
  new Array(length)
    .fill(0)
    .map(() => [~~(sigmoid(Math.random()) * 256), ~~(sigmoid(Math.random()) * 256), ~~(sigmoid(Math.random()) * 256)])
