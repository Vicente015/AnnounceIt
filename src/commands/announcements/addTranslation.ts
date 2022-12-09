import { EmbedLimits } from '@sapphire/discord-utilities'
import { Subcommand } from '@sapphire/plugin-subcommands'
import iso from 'iso-639-1'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import { validateChatInput } from '../../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  lang: ow.string.oneOf(iso.getAllCodes()).message(() => 'commands:add-translation.notValidLanguage'),
  title: ow.optional.string.maxLength(EmbedLimits.MaximumTitleLength).message(() => 'commands:add-translation.titleMaxLength'),
  footer: ow.optional.string.maxLength(EmbedLimits.MaximumFooterLength).message(() => 'commands:add-translation.footerMaxLength'),
  url: ow.optional.string.url.message(() => 'commands:add-translation.urlNotValid')
})

export async function addTranslation (interaction: Subcommand.ChatInputInteraction) {
  const options = await validateChatInput(interaction, Schema)
  if (!options) return
  const { footer, lang, name: id, t, title, url } = options

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await interaction.reply({ content: t('commands:add-translation.notFound'), ephemeral: true })
  await interaction.deferReply()

  const botMessage = await interaction.channel?.send(t('commands:add-translation.sendAnnouncementDescription'))
  const messageCollector = await interaction.channel?.awaitMessages({
    filter: (message) => message.author.id === interaction.user.id,
    max: 1,
    // 14 minutes
    time: 840 * 1000
  })
  const description = messageCollector.first()?.content
  if (botMessage?.deletable) await botMessage.delete()
  if (!description) return await interaction.editReply(t('commands:add-translation.descriptionNotSended'))
  if (description.length > EmbedLimits.MaximumDescriptionLength) return await interaction.editReply(t('commands:add-translation.descriptionMaxLength'))

  announcement.translations.push({
    description,
    footer,
    lang,
    title,
    url
  })
  await announcement.save()
  await interaction.editReply(t('commands:add-translation.done'))
}
