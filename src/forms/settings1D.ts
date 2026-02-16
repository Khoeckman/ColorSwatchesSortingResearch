import HyperStorage from 'hyperstorage-js'
import FormValidator from './FormValidator'
import { generateRandomRGB } from '..'
import { populateSolutions, emptySolutions } from '../1d'

const id = 'settings1D'

const defaultSettings = {
  swatchAmount: 44,
  swatchSizePx: 30,
}

export const settings = new HyperStorage<typeof defaultSettings>('swatches-' + id, defaultSettings)

const validator = new FormValidator(document.querySelector('form#' + id)!)

const elements = validator.form.elements
const fields = {
  swatchAmount: elements.namedItem(id + '-swatch-amount') as HTMLInputElement,
  swatchSizePx: elements.namedItem(id + '-swatch-size') as HTMLInputElement,
}

function loadSettings() {
  for (const key of Object.keys(fields) as Array<keyof typeof fields>) {
    fields[key].value = String(settings.value[key])
  }
}

function saveSettings() {
  settings.set('swatchAmount', +fields.swatchAmount.value)
  settings.set('swatchSizePx', +fields.swatchSizePx.value)
}

function applySettings() {
  emptySolutions()

  document.documentElement.style.setProperty('--swatch-size-1D', settings.value.swatchSizePx + 'px')

  const randomSwatches = generateRandomRGB(settings.value.swatchAmount)
  populateSolutions(randomSwatches)
}

loadSettings()
requestAnimationFrame(() => requestAnimationFrame(applySettings))

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
  document.documentElement.style.setProperty('--swatch-size', settings.value.swatchSizePx + 'px')
})

const resetBtn = validator.form.querySelector('.actions button[name="settings-reset"]')!

resetBtn.addEventListener('click', () => {
  settings.reset()
  loadSettings()
})

// Validation

validator.addValidator({
  name: 'settings-swatch-amount',
  method: (field) => +field.value >= 1 && +field.value <= 999,
  message: 'Should be between 1 and 999',
})

validator.addValidator({
  name: 'settings-swatch-size',
  method: (field) => +field.value >= 1 && +field.value <= 3200,
  message: 'Should be between 1 and 3200 pixels',
})
