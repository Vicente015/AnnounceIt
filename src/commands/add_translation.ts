import { CommandInteraction, Message } from 'discord.js'
import { TFunction } from 'i18next'
import iso from 'iso-639-1'
import { Announcement } from '../schemas/Announcement'
import Client from '../structures/Client'
import { URLRegex } from '../utils/Regex'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction) {
  const id = interaction.options.getString('name', true)
  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await interaction.reply({ content: t('commands:add_translation.notFound'), ephemeral: true })

  const lang = interaction.options.getString('lang', true)
  if (!iso.getNativeName(lang)) return await interaction.reply({ content: t('commands:add_translation.notValidLanguage'), ephemeral: true })
  const title = interaction.options.getString('title', false)
  const footer = interaction.options.getString('footer', false)
  const url = interaction.options.getString('url', false)

  if (footer && footer.length > 2048) return await interaction.reply({ content: t('commands:add_translation.footerMaxChars'), ephemeral: true })
  if (url && !URLRegex.test(url)) return await interaction.reply({ content: t('commands:add_translation.urlNotValid'), ephemeral: true })
  await interaction.deferReply()
  const botMessage = await interaction.channel?.send(t('commands:add_translation.sendAnnouncementDescription'))
  const messageCollector = await interaction.channel?.awaitMessages({
    filter: (message) => message.author.id === interaction.user.id,
    max: 1,
    // 14 minutes
    time: 840 * 1000
  })
  const description = messageCollector.first()?.content
  if (botMessage?.deletable) await botMessage.delete()
  if (!description) return await interaction.editReply(t('commands:add_translation.descriptionNotSended')) as Message
  if (description.length > 4096) return await interaction.editReply(t('commands:add_translation.descriptionMaxChars')) as Message

  announcement.translations.push({
    description,
    footer: footer ?? undefined,
    lang,
    title: title ?? undefined,
    url: url ?? undefined
  })
  await announcement.save()
  await interaction.editReply(t('commands:add_translation.done'))
}
