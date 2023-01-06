import languages from '@cospired/i18n-iso-languages'
import { AutoCompleteLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { AutocompleteInteraction } from 'discord.js'
import iso, { LanguageCode } from 'iso-639-1'
import { Announcement } from '../schemas/Announcement'

type AutocompleteOutput = Array<{
  name: string
  value: LanguageCode
}>

export class AutocompleteLanguages extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    })
  }

  public override async run (interaction: AutocompleteInteraction, result: AutocompleteOutput) {
    return await interaction.respond(result)
  }

  public override async parse (interaction: AutocompleteInteraction) {
    const { name: optionName, value: optionValue } = interaction.options.getFocused(true)
    if (optionName !== 'lang') return this.none()
    const subcommandName = interaction.options.getSubcommand(true)

    switch (subcommandName) {
      case 'edit': {
        const announcementId = interaction.options.getString('name', true)
        const announcement = await Announcement.findById(announcementId).exec().catch(() => {})
        if (!announcement) return

        const result = announcement.translations
          .map(({ lang: code }) => ({
            name: languages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code),
            value: code
          }))
          .filter(locale => locale.name.toLowerCase().includes(optionValue.toLowerCase()) || locale.value.includes(optionValue.toLowerCase()))

        if (result.length > AutoCompleteLimits.MaximumAmountOfOptions) result.length = AutoCompleteLimits.MaximumAmountOfOptions
        return this.some(result)
      }

      default: {
        const locales = iso
          .getAllCodes()
          .map(code =>
            ({
              name: languages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code),
              value: code
            })
          )

        const result = locales
          .filter(locale => locale.name.toLowerCase().includes(optionValue.toLowerCase()) || locale.value.includes(optionValue.toLowerCase()))

        if (result.length > AutoCompleteLimits.MaximumAmountOfOptions) result.length = AutoCompleteLimits.MaximumAmountOfOptions
        return this.some(result)
      }
    }
  }
}
