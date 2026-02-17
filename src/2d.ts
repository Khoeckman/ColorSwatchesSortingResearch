import Solver1D from './solver/Solver1D'
import Solver2D from './solver/Solver2D'
import { scoreSwatchPlane } from './solver/score'
import type { RGB } from 'color-convert'

function populateSolution(solution: Element, swatches: RGB[], stride: number) {
  const score = Math.floor(1 / scoreSwatchPlane(swatches, stride, 3))
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

export function populateSolutions(swatchesOriginal: RGB[], stride: number) {
  const solutions = [...document.querySelector('#two-d + .solutions')!.children]
  const N = swatchesOriginal.length

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

        const tsp2D = new Solver2D(swatches, stride, 2)

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
      case 4: {
        if (N <= 1) break

        const tsp2D = new Solver2D(swatches, stride, 2)

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
      case 5: {
        if (N <= 1) break

        const tsp2D = new Solver2D(swatches, stride, 2)

        await tsp2D.twoOpt(1e7 / tsp2D.N)
        swatches = tsp2D.getValuesFromPath()
        break
      }
      case 6: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 2)

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

        const tsp2D = new Solver2D(swatches, stride, 2)

        await tsp2D.twoOpt(1e8 / tsp2D.N)
        swatches = tsp2D.getValuesFromPath()
        break
      }
    }

    populateSolution(solution, swatches, stride)
  })
}

export function emptySolutions() {
  const solutions = [...document.querySelector('#two-d + .solutions')!.children]

  solutions.forEach((solution) => {
    if (solution.classList.contains('not-solution')) return
    solution.querySelector('.score')!.textContent = '0'
    solution.querySelector(':scope > ol')!.innerHTML = ''
  })
}
