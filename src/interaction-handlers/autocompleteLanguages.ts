import i18nLanguages from '@cospired/i18n-iso-languages'
import { AutoCompleteLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework'
import type { AutocompleteInteraction } from 'discord.js'
import iso, { LanguageCode } from 'iso-639-1'
import { Announcement } from '../schemas/Announcement.js'

interface Locale {
  name: string
  value: LanguageCode
}

export class AutocompleteLanguages extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    })
  }

  public override async run (interaction: AutocompleteInteraction, result: Locale[]) {
    return await interaction.respond(result)
  }

  public override async parse (interaction: AutocompleteInteraction) {
    const { name: optionName, value: query } = interaction.options.getFocused(true)
    if (optionName !== 'lang') return this.none()
    const subcommandName = interaction.options.getSubcommand(true)

    const getLocaleFromCode = (code: LanguageCode): Locale => ({
      name: i18nLanguages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code),
      value: code
    })

    const filterByQuery = (locale: Locale) => {
      const lowerCaseQuery = query.toLowerCase()
      return locale.name.toLowerCase().includes(lowerCaseQuery) || locale.value.includes(lowerCaseQuery)
    }

    switch (subcommandName) {
      case 'edit': {
        const announcementId = interaction.options.getString('name', true)
        const announcement = await Announcement.findById(announcementId).exec().catch(() => {})
        if (!announcement) return this.none()

        const result = announcement.translations
          .map(({ lang: code }) => getLocaleFromCode(code as LanguageCode))
          .filter((locale) => filterByQuery(locale))

        if (result.length > AutoCompleteLimits.MaximumAmountOfOptions) result.length = AutoCompleteLimits.MaximumAmountOfOptions
        return this.some(result)
      }

      default: {
        const result = iso
          .getAllCodes()
          .map((code) => getLocaleFromCode(code))
          .filter((locale) => filterByQuery(locale))

        if (result.length > AutoCompleteLimits.MaximumAmountOfOptions) result.length = AutoCompleteLimits.MaximumAmountOfOptions
        return this.some(result)
      }
    }
  }
}
