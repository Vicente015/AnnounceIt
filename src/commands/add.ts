
import { CommandInteraction, Message } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import { TFunction } from 'i18next'
import Client from '../structures/Client'

import { getFormat, extend, colord } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'
import labPlugin from 'colord/plugins/lab'
import lchPlugin from 'colord/plugins/lch'
import namesPlugin from 'colord/plugins/names'
import xyzPlugin from 'colord/plugins/xyz'

extend([namesPlugin, cmykPlugin, hwbPlugin, labPlugin, lchPlugin, xyzPlugin])
const validColorTypes = ['name', 'hex', 'rbg', 'hsl', 'hsv', 'hwb', 'xyz', 'lab', 'lch', 'cmyk']

export default async function run (client: Client, interaction: CommandInteraction, t: TFunction): Promise<Message | void> {
  const name = interaction.options.getString('name')
  const title = interaction.options.getString('title', false)
  let color = interaction.options.getString('color', false)

  if (color && (!getFormat(color) || !validColorTypes.includes(getFormat(color) as string))) {
    return await interaction.reply({
      content: t('commands:add.notValidColor', { validColors: validColorTypes.join(', ') }),
      ephemeral: true
    })
  } else {
    color = colord(color as string).toHex()
  }
  await interaction.deferReply()

  const botMsg = await interaction.channel!.send(t('commands:add_translation.sendAnnouncementDescription'))
  const msgCollector = await interaction.channel!.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  await botMsg.delete()
  if (!description) return await interaction.editReply(t('commands:add_translation.descriptionNotSended')) as Message
  if (description.length > 4096) return await interaction.editReply(t('commands:add_translation.descriptionMaxChars')) as Message

  const announcement = new Announcement({
    guildId: interaction.guildId,
    name,
    title,
    color,
    description
  })
  await announcement.save()

  interaction.editReply(t('commands:add.done'))
}
