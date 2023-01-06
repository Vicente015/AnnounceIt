import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { ModalSubmitInteraction } from 'discord.js'
import ow from 'ow'
import { Announcement } from '../schemas/Announcement'
import isValidColorFormat from '../utils/colorValidation'
import { reply } from '../utils/reply'
import { validaModalInput } from '../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  description: ow.string.nonEmpty.maxLength(TextInputLimits.MaximumValueCharacters).message(() => 'commands:add-translation.descriptionMaxLength'),
  footer: ow.optional.string.nonEmpty.maxLength(EmbedLimits.MaximumFooterLength).message(() => 'commands:add-translation.footerMaxLength'),
  title: ow.optional.string.nonEmpty.maxLength(EmbedLimits.MaximumTitleLength).message(() => 'commands:add-translation.titleMaxLength'),
  url: ow.optional.string.nonEmpty.url.message(() => 'commands:add-translation.urlNotValid'),
  color: ow.optional.string.nonEmpty.validate((string) => ({
    message: () => 'commands:add.notValidColor',
    validator: isValidColorFormat(string)
  }))
})

export class ModalHandler extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    })
  }

  public override parse (interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith('editAnnouncement:')) return this.none()
    return this.some()
  }

  public async run (interaction: ModalSubmitInteraction) {
    const options = await validaModalInput(interaction, Schema)
    if (!options) return
    const { color, description, footer, t, title, url } = options
    const [id, lang] = JSON.parse(interaction.customId.split(':').at(-1) as string) as string[]

    if (lang) {
      // todo: there is probably a better way to do this, I hate mongoose :((
      const announcement = await Announcement.findById(id).exec()
      if (!announcement) return
      const translationIndex = announcement.translations.findIndex((translation) => translation.lang === lang)
      const translation = announcement.translations[translationIndex]

      // ? update translation object
      announcement.translations[translationIndex] = {
        ...translation,
        description,
        footer,
        title,
        url
      }
      await announcement.save()

      return await reply(interaction, {
        content: t('commands:edit.done_translation'),
        type: 'positive'
      })
    } else {
      const result = await Announcement.findOneAndUpdate(
        { _id: id },
        { color, description, footer, title, url }
      ).exec().catch(() => {})

      if (!result) return await reply(interaction, { content: t('commands.edit.defaultError'), type: 'negative' })
      return await reply(interaction, {
        content: t('commands:edit.done_announcement'),
        type: 'positive'
      })
    }
  }
}
