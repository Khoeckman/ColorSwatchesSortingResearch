import type { RGB } from 'color-convert'
import awaitWorker from '../worker/awaitWorker'

export default class Solver1D {
  values: RGB[]
  power: number
  N: number
  distMatrix: number[][]
  path: number[]

  workers: Worker[] = []
  destructed = false // Prevent this instance from creating new workers

  constructor(values: RGB[], power = 1) {
    this.values = values.slice()
    this.power = power
    this.N = this.values.length
    this.path = this.values.map((_, i) => i)
    this.distMatrix = []
  }

  async createDistMatrix(distFn: 'LAB' | 'RGB' = 'LAB') {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/distMatrix.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, values: this.values, power: this.power, distFn })
    this.distMatrix = await awaitWorker(worker)
  }

  totalDist() {
    const path = this.path
    const distMatrix = this.distMatrix

    let sum = 0
    let prev = path[0]

    for (let i = 1, len = path.length; i < len; i++) {
      const curr = path[i]
      sum += distMatrix[prev][curr]
      prev = curr
    }
    return sum
  }

  async scorePath() {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/score/1d.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ N: this.N, distMatrix: this.distMatrix, power: this.power })
    return Math.round(1 / (await awaitWorker<number>(worker)))
  }

  async nearestNeighborPath(startIndex = 0) {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/greedy.ts', import.meta.url), { type: 'module' })
    this.workers.push(worker)
    worker.postMessage({ N: this.N, distMatrix: this.distMatrix, startIndex })
    this.path = await awaitWorker(worker)
  }

  async twoOpt() {
    if (this.destructed) return

    const worker = new Worker(new URL('../worker/twoOpt.ts', import.meta.url), { type: 'module' })
    this.workers.push(worker)
    worker.postMessage({ N: this.N, path: this.path, distMatrix: this.distMatrix })
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
