import { SapphireClient } from '@sapphire/framework'
import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, Events, Locale } from 'discord.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { emitEvent } from '../tests/helpers.js'
import { mockAutocompleteInteraction } from '../tests/interaction-mock.js'
import { setupBot } from '../tests/sapphire-mock.js'

let client: SapphireClient

beforeEach(async () => {
  client = await setupBot()
})

/*
  ## Tests:
  - ✅ Respond the interaction
  - ✅ Respond correctly
  - ✅ Respond in another language
  - ✅ Provide default output when input is invalid
 */

describe('autocompleteDates', () => {
  it('should respond the interaction', async () => {
    const interaction = mockAutocompleteInteraction({
      client,
      id: 'publish',
      name: 'publish',
      options: [
        {
          focused: true,
          name: 'date',
          type: ApplicationCommandOptionType.String,
          value: '3'
        }
      ]
    })
    await emitEvent(client, Events.InteractionCreate, interaction)

    expect(interaction.responded).toBe(true)
  })

  it('should respond something valid when input is invalid', async () => {
    const providedValue = 'invalid_text'
    const interaction = mockAutocompleteInteraction({
      client,
      id: 'publish',
      name: 'publish',
      options: [
        {
          focused: true,
          name: 'date',
          type: ApplicationCommandOptionType.String,
          value: providedValue
        }
      ]
    })

    // gets the interaction handler from the client store
    const autocompleteDates = client.stores.get('interaction-handlers').get('autocompleteDates')
    // parse the interaction manually
    const response = (await autocompleteDates?.parse(interaction))?.unwrap() as ApplicationCommandOptionChoiceData[]

    expect(Array.isArray(response)).toBe(true)
    expect(response.length).toBe(4)
    expect(response.every((item) => typeof item === 'object' && item !== null)).toBe(true)
  })

  it('should respond with correct names using valid units', async () => {
    const providedValue = '4'
    const interaction = mockAutocompleteInteraction({
      client,
      id: 'publish',
      name: 'publish',
      options: [
        {
          focused: true,
          name: 'date',
          type: ApplicationCommandOptionType.String,
          value: providedValue
        }
      ]
    })

    // gets the interaction handler from the client store
    const autocompleteDates = client.stores.get('interaction-handlers').get('autocompleteDates')
    // parse the interaction manually
    const response = (await autocompleteDates?.parse(interaction))?.unwrap() as ApplicationCommandOptionChoiceData[]

    const expectedUnits = ['minutes', 'hours', 'days', 'months']

    for (const [index, choice] of response.entries()) {
      expect(choice.name.startsWith(`in ${providedValue} ${expectedUnits[index]}`)).toBe(true)
    }
  })

  it('should respond with correct names using valid units in Spanish', async () => {
    const providedValue = '4'
    const interaction = mockAutocompleteInteraction({
      client,
      id: 'publish',
      locale: Locale.SpanishES,
      name: 'publish',
      options: [
        {
          focused: true,
          name: 'date',
          type: ApplicationCommandOptionType.String,
          value: providedValue
        }
      ]
    })

    // gets the interaction handler from the client store
    const autocompleteDates = client.stores.get('interaction-handlers').get('autocompleteDates')
    // parse the interaction manually
    const response = (await autocompleteDates?.parse(interaction))?.unwrap() as ApplicationCommandOptionChoiceData[]

    const expectedUnits = ['minutos', 'horas', 'días', 'meses']

    for (const [index, choice] of response.entries()) {
      expect(choice.name.startsWith(`en ${providedValue} ${expectedUnits[index]}`)).toBe(true)
    }
  })
})
