import type { RGB } from 'color-convert'
import { distLAB } from './deltaE'

export default class Solver2D {
  values: RGB[]
  N: number
  stride: number
  distMatrix: number[][]
  path: number[]

  constructor(values: RGB[], stride: number, power = 1, distFn = distLAB) {
    this.values = values.slice()
    this.N = this.values.length
    this.stride = stride
    this.path = this.values.map((_, i) => i)
    this.distMatrix = this.createDistMatrix(power, distFn)
  }

  private static async awaitWorker<T>(worker: Worker): Promise<T> {
    const result = await new Promise((resolve: (value: T) => void, reject) => {
      const handleMessage = (e: MessageEvent) => {
        worker.removeEventListener('message', handleMessage)
        resolve(e.data)
      }

      const handleError = (err: ErrorEvent) => {
        worker.removeEventListener('error', handleError)
        reject(err)
      }

      worker.addEventListener('message', handleMessage)
      worker.addEventListener('error', handleError)
    })
    worker.terminate()
    return result
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

  createDistMatrix(power: number, distFn: (a: RGB, b: RGB) => number): number[][] {
    const values = this.values
    const N = this.N

    const distMatrix = Array(N)
      .fill(0)
      .map(() => Array(N).fill(0))

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const d = Math.pow(distFn(values[i], values[j]), power) // 8 bit
        distMatrix[i][j] = d
        distMatrix[j][i] = d
      }
    }
    return distMatrix
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

  async snakePath(startIndex = 0) {
    const worker = new Worker(new URL('../worker/2d/snake.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, stride: this.stride, distMatrix: this.distMatrix, startIndex })
    this.path = await Solver2D.awaitWorker(worker)
  }

  async greedyPath(startIndex = 0) {
    const worker = new Worker(new URL('../worker/2d/greedy.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, stride: this.stride, distMatrix: this.distMatrix, startIndex })
    this.path = await Solver2D.awaitWorker(worker)
  }

  async simulatedAnnealing(startIndex = 0) {
    this.straightPath()
    this.path[this.path.indexOf(startIndex)] = 0
    this.path[0] = startIndex

    const worker = new Worker(new URL('../worker/2d/simulatedAnnealing.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, stride: this.stride, path: this.path, distMatrix: this.distMatrix })
    this.path = await Solver2D.awaitWorker(worker)
  }

  async twoOpt() {
    const worker = new Worker(new URL('../worker/2d/twoOpt.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, stride: this.stride, path: this.path, distMatrix: this.distMatrix })
    this.path = await Solver2D.awaitWorker(worker)
  }

  getValuesFromPath(path = this.path) {
    return (this.values = (path || this.path).map((i) => this.values[i]))
  }
}
