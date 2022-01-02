import { CommandInteraction } from 'discord.js'
import Announcement from '../schemas/Announcement'
import Client from '../structures/Client'

export default async function run (client: Client, interaction: CommandInteraction) {
  await interaction.deferReply()
  const id = interaction.options.getString('name')
  const lang = interaction.options.getString('lang')
  const title = interaction.options.getString('title', false)

  await interaction.channel.send('Manda un mensaje con la descripción')
  const msgCollector = await interaction.channel.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  if (!description) return await interaction.editReply('❌ Debe introducir una descripción.')
  if (description.length > 4096) return await interaction.editReply('❌ La descripción debe ser menor de 4096 caracteres.')

  const announcement = await Announcement.findById(id).exec()

  announcement.translations.push({
    lang,
    title,
    description
  })
  // TODO: Hacer comprobación de error en todos los cambios a la db
  announcement.save()

  interaction.editReply('✅ Se ha añadido la traducción del anuncio.')
}
