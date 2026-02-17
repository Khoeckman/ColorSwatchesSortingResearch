import TravelingSalesmanSolver from './solver/TravelingSalesmanSolver'
import TravelingSalesmanSolver2D from './solver/TravelingSalesmanSolver2D'
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
        // Best 1D solver
        if (N <= 1) break

        const tsp = new TravelingSalesmanSolver(swatches, 3)

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 24)
        for (let start = 0; start < Math.min(N, 24); start++) {
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
        // 2D greedy solver
        if (N <= 1) break

        const tsp2D = new TravelingSalesmanSolver2D(swatches, stride, 3)

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 12)
        for (let start = 0; start < Math.min(N, 12); start++) {
          await tsp2D.greedyNearestNeighborPath(start)
          await tsp2D.twoOpt()

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
        // 2D smart solver
        if (N <= 1) break

        const tsp2D = new TravelingSalesmanSolver2D(swatches, stride, 3)

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 12)
        for (let start = 0; start < Math.min(N, 12); start++) {
          await tsp2D.smartNearestNeighborPath(start)
          await tsp2D.twoOpt()

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
  const solutions = [...document.querySelector('#two-d + .solutions')!.children]

  solutions.forEach((solution) => {
    const ol = solution.querySelector(':scope > ol')
    if (!ol) return
    ol.innerHTML = ''
  })
}
