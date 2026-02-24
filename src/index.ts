import type { RGB } from 'color-convert'

/** Extremely fast, simple 32‑bit PRNG */
function Mulberry32(seed: number) {
  let state = seed >>> 0

  return {
    next() {
      let t = (state + 0x6d2b79f5) | 0
      state = t
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}

// Mulberry32 is ±392% faster than Math.random()
// Benchmark: https://jsbm.dev/muLCWR9RJCbmy
// Spectral test: /demo/mulberry32.html
const prng = Mulberry32(Math.random() * 4294967296).next

const sigmoid = (z: number) => 1 / (1 + Math.exp(-8 * (z - 0.5)))

export const generateRandomRGB = (length: number): RGB[] =>
  new Array(length).fill(0).map(() => [~~(sigmoid(prng()) * 256), ~~(sigmoid(prng()) * 256), ~~(sigmoid(prng()) * 256)])
