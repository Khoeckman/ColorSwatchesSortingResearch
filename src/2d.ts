import TravelingSalesmanSolver from './TravelingSalesmanSolver'
import { scoreSwatchPlane } from './score'
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

      case 2:
        if (N <= 1) break

        const tsp = new TravelingSalesmanSolver(swatches, 3)

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 120)
        for (let start = 0; start < Math.min(N, 120); start++) {
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
