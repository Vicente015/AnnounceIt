
import { CommandInteraction, Message } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
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

export default async function run (client: Client, interaction: CommandInteraction): Promise<Message | void> {
  await interaction.deferReply()
  const name = interaction.options.getString('name')
  const title = interaction.options.getString('title', false)
  let color = interaction.options.getString('color', false)

  if (color && (!getFormat(color) || !validColorTypes.includes(getFormat(color) as string))) {
    return await interaction.reply({ content: `❌ Formato de color inválido, pruebe con alguno de los siguientes: ${validColorTypes.join(', ')}.` })
  } else {
    color = colord(color as string).toHex()
  }

  await interaction.channel!.send('Envíe un mensaje con la descripción, tiene 14 minutos.')
  const msgCollector = await interaction.channel!.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  if (!description) return await interaction.editReply('❌ Debe introducir una descripción.') as Message
  if (description.length > 4096) return await interaction.editReply('❌ La descripción debe ser menor de 4096 caracteres.') as Message

  const announcement = new Announcement({
    guildId: interaction.guildId,
    name,
    title,
    color,
    description
  })
  await announcement.save()

  interaction.editReply('✅ Anuncio creado.')
}
