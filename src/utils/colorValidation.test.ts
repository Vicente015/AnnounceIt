import { describe, expect, it } from 'vitest'
import hasValidColorFormat from './colorValidation.js'

it('should return false on invalid format', () => {
  expect(hasValidColorFormat('cmyk(100%, 0%, 0%, 0%)')).toBe(false)
})

describe('should return true on valid format', () => {
  const exampleColors = ['pink', '#0000', '#fefefe', 'rgb(128, 128, 128)', 'hsl(180deg, 50%, 50%)']

  it.each(exampleColors)('hasValidColorFormat(%s)', (color) => {
    expect(hasValidColorFormat(color)).toBe(true)
  })
})
