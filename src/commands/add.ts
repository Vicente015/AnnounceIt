import { colord, extend, getFormat } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'
import labPlugin from 'colord/plugins/lab'

import lchPlugin from 'colord/plugins/lch'
import namesPlugin from 'colord/plugins/names'
import xyzPlugin from 'colord/plugins/xyz'
import { CommandInteraction, Message } from 'discord.js'
import { TFunction } from 'i18next'
import { Announcement } from '../schemas/Announcement'
import Client from '../structures/Client'
import { URLRegex } from '../utils/Regex'

extend([namesPlugin, cmykPlugin, hwbPlugin, labPlugin, lchPlugin, xyzPlugin])
const validColorTypes = ['name', 'hex', 'rbg', 'hsl', 'hsv', 'hwb', 'xyz', 'lab', 'lch', 'cmyk']
const isValidColorFormat = (color: string) => getFormat(color) && validColorTypes.includes(getFormat(color) ?? '')

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction) {
  const name = interaction.options.getString('name', true)
  const title = interaction.options.getString('title', false)
  let color = interaction.options.getString('color', false)
  const footer = interaction.options.getString('footer', false)
  const url = interaction.options.getString('url', false)

  if (footer && footer.length > 2048) return await interaction.reply({ content: t('commands:add_translation.footerMaxChars'), ephemeral: true })
  if (url && !URLRegex.test(url)) return await interaction.reply({ content: t('commands:add_translation.urlNotValid'), ephemeral: true })
  if (color) {
    if (!isValidColorFormat(color)) {
      return await interaction.reply({
        content: t('commands:add.notValidColor', { validColors: validColorTypes.join(', ') }),
        ephemeral: true
      })
    }
    color = colord(color).toHex()
  }

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

  const announcement = new Announcement({
    color,
    description,
    footer,
    guildId: interaction.guildId,
    name,
    title,
    url
  })
  await announcement.save()
  await interaction.editReply(t('commands:add.done'))
}
