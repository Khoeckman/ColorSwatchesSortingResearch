import Solver1D from './solver/Solver1D'
import Solver2D from './solver/Solver2D'
import HilbertAlgorithm from './solver/HilbertAlgorithm'
import type { RGB } from 'color-convert'

async function populateSolution(solution: Element, swatches: RGB[], stride: number) {
  const tsp2D = new Solver2D(swatches, stride, 3)
  solvers.push(tsp2D)

  await tsp2D.createDistMatrix()
  const score = await tsp2D.scorePath()
  solution.querySelector('.score')!.textContent = String(score)

  const swatchesPlane = solution.querySelector('ol')
  if (!swatchesPlane) return

  swatchesPlane.innerHTML = ''

  for (let rowStart = 0; rowStart < swatches.length; rowStart += stride) {
    const rowLi = document.createElement('li')
    const rowOl = document.createElement('ol')

    // Add swatches for this row
    for (let i = rowStart; i < rowStart + stride && i < swatches.length; i++) {
      const [r, g, b] = swatches[i]
      const swatchLi = document.createElement('li')
      swatchLi.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
      rowOl.appendChild(swatchLi)
    }

    rowLi.appendChild(rowOl)
    swatchesPlane.appendChild(rowLi)
  }
}

function toSnakeOrder(swatches: number[], stride: number): void {
  const rows = Math.ceil(swatches.length / stride)

  for (let row = 0; row < rows; ++row) {
    if (!(row % 2)) continue

    const start = row * stride
    const end = Math.min(start + stride, swatches.length)

    let i = start
    let j = end - 1

    while (i < j) {
      const tmp = swatches[i]
      swatches[i] = swatches[j]
      swatches[j] = tmp
      ++i
      --j
    }
  }
}

function getHilbertOrder(stride: number, N: number): number[] {
  const height = Math.ceil(N / stride)
  const order = Math.ceil(Math.log2(Math.max(stride, height)))
  const hilbert = new HilbertAlgorithm(order)

  let hilbertOrder: number[] = []

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < stride; ++x) {
      const idx = hilbert.pointToIndex({ x, y })
      hilbertOrder.push(idx)
    }
  }

  const sortedHilbert = structuredClone(hilbertOrder).sort()

  const pos = new Map()
  sortedHilbert.forEach((v, i) => pos.set(v, i))

  return hilbertOrder.map((v) => pos.get(v))
}

let solvers: (Solver1D | Solver2D)[] = []

export function populateSolutions(swatchesOriginal: RGB[], stride: number) {
  const solutions = [...document.querySelector('#two-d + .solutions')!.children]
  const N = swatchesOriginal.length

  const hilbertOrder = getHilbertOrder(stride, N)

  solutions.forEach(async (solution, i) => {
    if (solution.classList.contains('not-solution')) return

    let swatches = structuredClone(swatchesOriginal)

    switch (i) {
      case 0: // Settings form
      case 1: // Generated
        break

      case 2: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 6)
        for (let start = 0; start < Math.min(N, 6); start++) {
          await tsp.nearestNeighborPath(start)
          await tsp.twoOpt()

          const score = tsp.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp.path
          }
        }
        swatches = tsp.getValuesFromPath(bestPath)
        break
      }
      case 3: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 6)
        for (let start = 0; start < Math.min(N, 6); start++) {
          await tsp.nearestNeighborPath(start)
          await tsp.twoOpt()

          const score = tsp.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp.path
          }
        }
        toSnakeOrder(bestPath, stride)
        swatches = tsp.getValuesFromPath(bestPath)
        break
      }
      case 4: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 6)
        for (let start = 0; start < Math.min(N, 6); start++) {
          await tsp.nearestNeighborPath(start)
          await tsp.twoOpt()

          const score = tsp.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp.path
          }
        }

        bestPath = hilbertOrder.map((i) => bestPath[i])
        swatches = tsp.getValuesFromPath(bestPath)
        break
      }
      case 5: {
        if (N <= 1) break

        const tsp2D = new Solver2D(swatches, stride, 2)
        solvers.push(tsp2D)

        await tsp2D.createDistMatrix()
        await tsp2D.twoOpt(1e7 / tsp2D.N)
        swatches = tsp2D.getValuesFromPath()
        break
      }
      case 6: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 6)
        for (let start = 0; start < Math.min(N, 6); start++) {
          await tsp.nearestNeighborPath(start)
          await tsp.twoOpt()

          const score = tsp.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp.path
          }
        }

        bestPath = hilbertOrder.map((i) => bestPath[i])
        swatches = tsp.getValuesFromPath(bestPath)

        const tsp2D = new Solver2D(swatches, stride, 2)
        solvers.push(tsp2D)

        await tsp2D.createDistMatrix()
        await tsp2D.twoOpt(1e8 / tsp2D.N)
        swatches = tsp2D.getValuesFromPath()
        break
      }
      case 7: {
        if (N <= 1) break

        const tsp2D = new Solver2D(swatches, stride, 2)
        solvers.push(tsp2D)

        await tsp2D.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 6)
        for (let start = 0; start < Math.min(N, 6); start++) {
          await tsp2D.snakePath(start)
          await tsp2D.twoOpt(1e9 / tsp2D.N ** 2)

          const score = tsp2D.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp2D.path
          }
        }
        swatches = tsp2D.getValuesFromPath(bestPath)
        break
      }
      case 8: {
        if (N <= 1) break

        const tsp2D = new Solver2D(swatches, stride, 2)
        solvers.push(tsp2D)

        await tsp2D.createDistMatrix()

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 2)
        for (let start = 0; start < Math.min(N, 2); start++) {
          await tsp2D.greedyPath(start)
          await tsp2D.twoOpt(6e9 / tsp2D.N ** 2)

          const score = tsp2D.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp2D.path
          }
        }
        swatches = tsp2D.getValuesFromPath(bestPath)
        break
      }
    }

    populateSolution(solution, swatches, stride)
  })
}

export function emptySolutions() {
  for (const solver of solvers) {
    solver.destruct()
  }
  solvers = []

  const solutions = [...document.querySelector('#two-d + .solutions')!.children]

  solutions.forEach((solution) => {
    if (solution.classList.contains('not-solution')) return
    solution.querySelector('.score')!.textContent = '0'
    solution.querySelector(':scope > ol')!.innerHTML = ''
  })
}
