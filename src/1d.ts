import convert from 'color-convert'
import { distRGB } from './solver/deltaE'
import Solver1D from './solver/Solver1D'
import { scoreSwatchLine } from './solver/score'
import type { RGB } from 'color-convert'

function populateSolution(solution: Element, swatches: RGB[]) {
  const score = Math.floor(1 / scoreSwatchLine(swatches, 3))
  solution.querySelector('.score')!.textContent = String(score)

  const swatchesLine = solution.querySelector('ol')
  if (!swatchesLine) return

  swatchesLine.innerHTML = ''

  swatches.forEach(([r, g, b]) => {
    const li = document.createElement('li')
    li.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    swatchesLine.appendChild(li)
  })
}

let solvers: Solver1D[] = []

export function populateSolutions(swatchesOriginal: RGB[]) {
  const solutions = [...document.querySelector('#one-d + .solutions')!.children]
  const N = swatchesOriginal.length

  solutions.forEach(async (solution, i) => {
    if (solution.classList.contains('not-solution')) return

    let swatches = structuredClone(swatchesOriginal)

    switch (i) {
      case 0: // Settings form
      case 1: // Generated
        break

      case 2:
        // Sort by relative hue
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const hueA = Math.atan2(Math.sqrt(3) * (ag - ab), 2 * ar - ag - ab)
          const hueB = Math.atan2(Math.sqrt(3) * (bg - bb), 2 * br - bg - bb)
          return hueA - hueB
        })
        break
      case 3:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [, satA] = convert.rgb.hsl.raw(ar, ag, ab)
          const [, satB] = convert.rgb.hsl.raw(br, bg, bb)
          return satA - satB
        })
        break
      case 4:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [, , lightA] = convert.rgb.hsl.raw(ar, ag, ab)
          const [, , lightB] = convert.rgb.hsl.raw(br, bg, bb)
          return lightA - lightB
        })
        break
      case 5:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [, , valA] = convert.rgb.hsv.raw(ar, ag, ab)
          const [, , valB] = convert.rgb.hsv.raw(br, bg, bb)
          return valA - valB
        })
        break

      case 6:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [hueA, satA] = convert.rgb.hsl.raw(ar, ag, ab)
          const [hueB, satB] = convert.rgb.hsl.raw(br, bg, bb)

          const groupA = +(satA > 50)
          const groupB = +(satB > 50)

          return groupA - groupB || hueA - hueB
        })
        break
      case 7:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [hueA, , lightA] = convert.rgb.hsl.raw(ar, ag, ab)
          const [hueB, , lightB] = convert.rgb.hsl.raw(br, bg, bb)

          const groupA = +(lightA > 50)
          const groupB = +(lightB > 50)

          return groupA - groupB || hueA - hueB
        })
        break
      case 8:
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const [hueA, , valA] = convert.rgb.hsv.raw(ar, ag, ab)
          const [hueB, , valB] = convert.rgb.hsv.raw(br, bg, bb)

          const groupA = +(valA > 50)
          const groupB = +(valB > 50)

          return groupA - groupB || hueA - hueB
        })
        break

      case 9: {
        swatches.sort(([ar, ag, ab], [br, bg, bb]) => {
          const hueA = Math.atan2(Math.sqrt(3) * (ag - ab), 2 * ar - ag - ab)
          const hueB = Math.atan2(Math.sqrt(3) * (bg - bb), 2 * br - bg - bb)
          return hueA - hueB
        })

        const tsp = new Solver1D(swatches)
        solvers.push(tsp)

        await tsp.twoOpt()
        swatches = tsp.getValuesFromPath()
        break
      }
      case 10: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.nearestNeighborPath()
        swatches = tsp.getValuesFromPath()
        break
      }
      case 11: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        let bestPath: number[] = []
        let bestScore = Infinity

        // Start from every swatch (max 120)
        for (let start = 0; start < Math.min(N, 120); start++) {
          await tsp.nearestNeighborPath(start)

          const score = tsp.totalDist()

          if (score < bestScore) {
            bestScore = score
            bestPath = tsp.path
          }
        }

        swatches = tsp.getValuesFromPath(bestPath)
        break
      }
      case 12: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

        await tsp.nearestNeighborPath()
        await tsp.twoOpt()
        swatches = tsp.getValuesFromPath()
        break
      }
      case 13: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3)
        solvers.push(tsp)

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
      case 14: {
        if (N <= 1) break

        const tsp = new Solver1D(swatches, 3, distRGB)
        solvers.push(tsp)

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
    }

    populateSolution(solution, swatches)
  })
}

export function emptySolutions() {
  for (const solver of solvers) {
    solver.destruct()
  }
  solvers = []

  const solutions = [...document.querySelector('#one-d + .solutions')!.children]

  solutions.forEach((solution) => {
    if (solution.classList.contains('not-solution')) return
    solution.querySelector('.score')!.textContent = '0'
    solution.querySelector(':scope > ol')!.innerHTML = ''
  })
}
