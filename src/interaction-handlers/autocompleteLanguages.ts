import languages from '@cospired/i18n-iso-languages'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { AutocompleteInteraction } from 'discord.js'
import iso, { LanguageCode } from 'iso-639-1'

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

  public override parse (interaction: AutocompleteInteraction) {
    const { name: optionName, value: optionValue } = interaction.options.getFocused(true)
    if (optionName !== 'lang') return this.none()

    const locales = iso
      .getAllCodes()
      .map(code =>
        ({
          code,
          name: languages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code)
        })
      )

    const result = locales
      .filter(locale => locale.name.toLowerCase().includes(optionValue.toLowerCase()) || locale.code.includes(optionValue.toLowerCase()))
      .map((locale) => ({ name: locale.name, value: locale.code }))
    if (result.length > 25) result.length = 25
    return this.some(result)
  }
}
