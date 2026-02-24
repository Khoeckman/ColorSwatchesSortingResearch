import HyperStorage from 'hyperstorage-js'
import FormValidator from './FormValidator'
import { generateRandomRGB } from '..'
import { populateSolutions, emptySolutions } from '../2d'

const id = 'settings2D'

const defaultSettings = {
  swatchAmountX: 32,
  swatchAmountY: 32,
  swatchSizePx: 20,
}

export const settings = new HyperStorage<typeof defaultSettings>('swatches-' + id, defaultSettings)

const validator = new FormValidator(document.querySelector('form#' + id)!)

const elements = validator.form.elements
const fields = {
  swatchAmountX: elements.namedItem(id + '-swatch-amount-x') as HTMLInputElement,
  swatchAmountY: elements.namedItem(id + '-swatch-amount-y') as HTMLInputElement,
  swatchSizePx: elements.namedItem(id + '-swatch-size') as HTMLInputElement,
}

function loadSettings() {
  for (const key of Object.keys(fields) as Array<keyof typeof fields>) {
    fields[key].value = String(settings.value[key])
  }
}

function saveSettings() {
  settings.set('swatchAmountX', +fields.swatchAmountX.value)
  settings.set('swatchAmountY', +fields.swatchAmountY.value)
  settings.set('swatchSizePx', +fields.swatchSizePx.value)
}

function applySettings() {
  emptySolutions()

  document.documentElement.style.setProperty('--swatch-size-2D', settings.value.swatchSizePx + 'px')

  const randomSwatches = generateRandomRGB(settings.value.swatchAmountX * settings.value.swatchAmountY)
  populateSolutions(randomSwatches, settings.value.swatchAmountX)
}

loadSettings()
setTimeout(applySettings, 800)

validator.form.addEventListener('submit', (e: SubmitEvent) => {
  const form = e.target
  if (!(form instanceof HTMLFormElement)) return
  e.preventDefault()

  saveSettings()
  applySettings()
})

const updateBtn = validator.form.querySelector('.actions button[name="settings-update"]')!

updateBtn.addEventListener('click', () => {
  saveSettings()
  document.documentElement.style.setProperty('--swatch-size-2D', settings.value.swatchSizePx + 'px')
})

const resetBtn = validator.form.querySelector('.actions button[name="settings-reset"]')!

resetBtn.addEventListener('click', () => {
  settings.reset()
  loadSettings()
})

// Validation

validator.addValidator({
  name: 'settings2D-swatch-amount-x',
  method: (field) => +field.value >= 1 && +field.value * +fields.swatchAmountY.value < 1000,
  message: 'Total amount of swatches should be between 1 and 999',
})

validator.addValidator({
  name: 'settings2D-swatch-amount-x',
  method: (field) => +field.value >= 1 && +field.value * +fields.swatchAmountX.value < 1000,
  message: 'Total amount of swatches should be between 1 and 999',
})

validator.addValidator({
  name: 'settings2D-swatch-size',
  method: (field) => +field.value >= 1 && +field.value <= 3200,
  message: 'Should be between 1 and 3200 pixels',
})
