import { CommandInteraction } from 'discord.js'
import Annnouncement from '../schemas/Announcement'
import Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction): Promise <void> {
  if (interaction.channel == null) return
  await interaction.deferReply()
  const name = interaction.options.getString('name')
  const title = interaction.options.getString('title', false)
  const color = interaction.options.getString('color', false)

  await interaction.channel.send('Manda un mensaje con la descripción')
  const msgCollector = await interaction.channel.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 30 * 1000,
    max: 1
  })
  const description = msgCollector.first()?.content

  const announcement = new Annnouncement({
    name,
    title,
    color,
    description
  })
  await announcement.save()

  await interaction.editReply('Anuncio creado uwu (✿◡‿◡)')
}
