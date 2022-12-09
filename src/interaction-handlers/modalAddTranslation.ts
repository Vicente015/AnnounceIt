import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { ModalSubmitInteraction } from 'discord.js'
import ow from 'ow'
import { Announcement } from '../schemas/Announcement'
import { validaModalInput } from '../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  description: ow.string.nonEmpty.maxLength(TextInputLimits.MaximumValueCharacters).message(() => 'commands:add-translation.descriptionMaxLength'),
  footer: ow.optional.string.nonEmpty.maxLength(EmbedLimits.MaximumFooterLength).message(() => 'commands:add-translation.footerMaxLength'),
  title: ow.optional.string.nonEmpty.maxLength(EmbedLimits.MaximumTitleLength).message(() => 'commands:add-translation.titleMaxLength'),
  url: ow.optional.string.nonEmpty.url.message(() => 'commands:add-translation.urlNotValid')
})

export class ModalHandler extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    })
  }

  public override parse (interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith('addTranslation:')) return this.none()
    return this.some()
  }

  public async run (interaction: ModalSubmitInteraction) {
    const options = await validaModalInput(interaction, Schema)
    if (!options) return
    const { description, footer, t, title, url } = options
    const [id, lang] = JSON.parse(interaction.customId.split(':').at(-1) as string) as string[]
    const announcement = await Announcement.findById(id).exec().catch(() => {})
    if (!announcement) return

    announcement.translations.push({
      description,
      footer,
      lang,
      title,
      url
    })
    await announcement.save()
    await interaction.reply(t('commands:add-translation.done'))
  }
}
