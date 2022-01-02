import { CommandInteraction } from 'discord.js'
import Annnouncement from '../schemas/Announcement'
import Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction) {
  await interaction.deferReply()
  const name = interaction.options.getString('name')
  const title = interaction.options.getString('title', false)
  const color = interaction.options.getString('color', false)

  await interaction.channel.send('Envíe un mensaje con la descripción, tiene 14 minutos.')
  const msgCollector = await interaction.channel.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  if (!description) return await interaction.editReply('❌ Debe introducir una descripción.')
  if (description.length > 4096) return await interaction.editReply('❌ La descripción debe ser menor de 4096 caracteres.')

  const announcement = new Annnouncement({
    guildId: interaction.guildId,
    name,
    title,
    color,
    description
  })
  await announcement.save()

  interaction.editReply('✅ Anuncio creado.')
}
