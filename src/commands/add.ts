import { CommandInteraction } from "discord.js";
import Annnouncement from "../schemas/Announcement"
import Client from "../structures/Client"

export default async function run(client: Client, interaction: CommandInteraction) {
  await interaction.deferReply()
  let title = interaction.options.getString('title', false)
  let color = interaction.options.getString('color', false)

  await interaction.channel.send('Manda un mensaje con la descripción')
  let msgCollector = await interaction.channel.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 30 * 1000,
    max: 1,
  })
  let description = msgCollector.first()?.content

  let announcement = new Annnouncement({
    title,
    color,
    description
  })
  await announcement.save()

  interaction.editReply('Anuncio creado uwu (✿◡‿◡)')
}