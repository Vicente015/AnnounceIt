import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework'
import dayjs, { Dayjs, ManipulateType } from 'dayjs'
import LocalizedFormatPlugin from 'dayjs/plugin/localizedFormat.js'
import RelativeTimePlugin from 'dayjs/plugin/relativeTime.js'
import UTCPlugin from 'dayjs/plugin/utc.js'
import type { AutocompleteInteraction } from 'discord.js'

dayjs.extend(UTCPlugin)
dayjs.extend(LocalizedFormatPlugin)
dayjs.extend(RelativeTimePlugin)

export class AutocompleteDates extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    })
  }

  public override async run (interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return await interaction.respond(result)
  }

  public override async parse (interaction: AutocompleteInteraction) {
    const { name: optionName, value } = interaction.options.getFocused(true)
    if (optionName !== 'date') return this.none()
    const locale = interaction.locale.toLowerCase().split('-')[0]
    await import(`dayjs/locale/${locale}.js`)
    const actualDate = dayjs().utc().locale(locale)

    const parsedValue = Number.parseInt(value)
    const optionValue = !Number.isNaN(parsedValue) && parsedValue > 0 ? parsedValue : 1

    const formatDate = (date: Dayjs) => actualDate.to(date) + date.format(' (YYYY/MM/DD HH:mm') + ' UTC)'

    const units: ManipulateType[] = [
      'minutes',
      'hours',
      'days',
      'months'
    ]

    const dates = units
      .map((unit) => actualDate.add(optionValue, unit))
      .filter((date) => date.isBefore(actualDate.add(1, 'year')))
      .map((date) => ({
        name: formatDate(date),
        value: date.toISOString()
      }))
    return this.some(dates)
  }
}
