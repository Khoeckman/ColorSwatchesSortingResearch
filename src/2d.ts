import convert from 'color-convert'
import TravelingSalesmanSolver from './TravelingSalesmanSolver'
import { scoreSwatchPlane } from './score'
import type { RGB } from 'color-convert'

function populateSolution2D(solution: Element, swatches: RGB[], stride: number) {
  const score = Math.floor(1 / scoreSwatchPlane(swatches, stride, 3))
  solution.querySelector('.score')!.textContent = String(score)

  const swatchesPlane = solution.querySelector('ol')
  if (!swatchesPlane) return

  swatchesPlane.innerHTML = ''

  swatches.forEach(([r, g, b], i) => {
    if (!(i % stride)) {
      // start on new ol
    }

    const li = document.createElement('li')
    li.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    swatchesPlane.appendChild(li)
  })
}

export function populateSolutions2D(swatchesOriginal: RGB[], stride: number) {
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

    populateSolution2D(solution, swatches, stride)
  })
}
