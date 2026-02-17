import convert from 'color-convert'
import type { RGB, LAB } from 'color-convert'
import { getDeltaE_CIEDE2000 } from 'deltae-js'

export function distRGB(a: RGB, b: RGB) {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]

  return dr * dr + dg * dg + db * db
}

export function distLAB(a: RGB, b: RGB) {
  const x1: LAB = convert.rgb.lab.raw(a)
  const x2: LAB = convert.rgb.lab.raw(b)
  return getDeltaE_CIEDE2000(x1, x2)
}
