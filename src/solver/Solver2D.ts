import type { RGB } from 'color-convert'
import awaitWorker from '../worker/awaitWorker'

export default class Solver2D {
  values: RGB[]
  power: number
  N: number
  stride: number
  distMatrix: number[][]
  path: number[]

  workers: Worker[] = []
  destructed = false // Prevent this instance from creating new workers

  constructor(values: RGB[], stride: number, power = 1) {
    this.values = values.slice()
    this.power = power
    this.N = this.values.length
    this.stride = stride
    this.path = this.values.map((_, i) => i)
    this.distMatrix = []
  }

  private getNeighbors(index: number): number[] {
    const neighbors: number[] = []

    // Right neighbor
    if (index % this.stride < this.stride - 1 && index + 1 < this.N) {
      neighbors.push(index + 1)
    }

    // Down neighbor
    if (index + this.stride < this.N) {
      neighbors.push(index + this.stride)
    }

    return neighbors
  }

  async createDistMatrix(distFn: 'LAB' | 'RGB' = 'LAB') {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/distMatrix.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, values: this.values, power: this.power, distFn })
    this.distMatrix = await awaitWorker(worker)
  }

  totalDist() {
    const distMatrix = this.distMatrix
    let sum = 0

    for (let i = 0; i < this.N; i++) {
      const neighbors = this.getNeighbors(i)

      for (const j of neighbors) {
        sum += distMatrix[this.path[i]][this.path[j]]
      }
    }

    return sum
  }

  straightPath() {
    this.path = this.values.map((_, i) => i)
  }

  async scorePath() {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/score/2d.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, distMatrix: this.distMatrix, stride: this.stride, power: this.power })
    return Math.round(1 / (await awaitWorker<number>(worker)))
  }

  async snakePath(startIndex = 0) {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/2d/snake.ts', import.meta.url), { type: 'module' })
    this.workers.push(worker)
    worker.postMessage({ N: this.N, stride: this.stride, distMatrix: this.distMatrix, startIndex })
    this.path = await awaitWorker(worker)
  }

  async greedyPath(startIndex = 0) {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/2d/greedy.ts', import.meta.url), { type: 'module' })
    this.workers.push(worker)
    worker.postMessage({ N: this.N, stride: this.stride, distMatrix: this.distMatrix, startIndex })
    this.path = await awaitWorker(worker)
  }

  async twoOpt(maxImprovements = 1e8 / this.N ** 2) {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/2d/twoOpt.ts', import.meta.url), { type: 'module' })
    this.workers.push(worker)
    worker.postMessage({
      N: this.N,
      stride: this.stride,
      path: this.path,
      distMatrix: this.distMatrix,
      maxImprovements,
    })
    this.path = await awaitWorker(worker)
  }

  getValuesFromPath(path = this.path) {
    return (this.values = (path || this.path).map((i) => this.values[i]))
  }

  terminateWorkers() {
    for (const worker of this.workers) {
      worker.terminate()
    }
    this.workers = []
  }

  destruct() {
    this.terminateWorkers()
    this.destructed = true
  }
}
