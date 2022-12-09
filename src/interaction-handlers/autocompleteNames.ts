import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { AutocompleteInteraction } from 'discord.js'
import { Announcement } from '../schemas/Announcement'

export class AutocompleteNames extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    })
  }

  public override async run (interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return await interaction.respond(result)
  }

  public override async parse (interaction: AutocompleteInteraction) {
    const { name: optionName, value: optionValue } = interaction.options.getFocused(true)
    if (optionName !== 'name') return this.none()

    const announcements = await Announcement.find({ guildId: interaction.guildId })
    const result = announcements
      .filter(announcement => announcement.name.toLowerCase().includes(optionValue.toString().toLowerCase()))
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
      .map((announcement) => ({ name: announcement.name, value: announcement._id.toString() }))

    return this.some(result)
  }
}
