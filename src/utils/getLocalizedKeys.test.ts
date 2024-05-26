import { describe, expect, it } from 'vitest'
import { getCommandKeys, getOptionDescriptionKey } from './getLocalizedKeys.js'

describe('getCommandKeys()', () => {
  it('should return the correct key', () => {
    expect(
      getCommandKeys('announcements', 'add')
    )
      .toEqual(['meta:announcements.add.name', 'meta:announcements.add.description'])
  })

  it('should return empty keys', () => {
    expect(
      getCommandKeys()
    )
      .toEqual(['meta:.name', 'meta:.description'])
  })
})

describe('getOptionDescriptionKey()', () => {
  it('should return the correct key', () => {
    expect(
      getOptionDescriptionKey('publish', 'announcements', 'add')
    )
      .toBe('meta:announcements.add.options.publish')
  })

  it('should return just option name', () => {
    expect(
      getOptionDescriptionKey('publish')
    )
      .toBe('meta:.options.publish')
  })

  it('should return undefined', () => {
    expect(
      // @ts-expect-error testing
      getOptionDescriptionKey()
    )
      .toBe('meta:.options.undefined')
  })
})
