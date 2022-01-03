import { CommandInteraction, Message } from 'discord.js'
import { Announcement, AnnouncementType } from '../schemas/Announcement'
import Client from '../structures/Client'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction): Promise<Message | void> {
  const id = interaction.options.getString('name')
  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (announcement == null) return await interaction.reply({ content: '❌ No se ha encontrado el anuncio.', ephemeral: true })

  const lang = interaction.options.getString('lang', true)
  if (!iso.getNativeName(lang)) return await interaction.reply({ content: '❌ Ese idioma no es válido.', ephemeral: true })
  const title = interaction.options.getString('title', false) ?? undefined

  await interaction.deferReply()
  const botMsg = await interaction.channel!.send('Envíe un mensaje con la descripción, tiene 14 minutos.')
  const msgCollector = await interaction.channel!.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  await botMsg.delete()
  if (!description) return await interaction.editReply('❌ Debe introducir una descripción.') as Message
  if (description.length > 4096) return await interaction.editReply('❌ La descripción debe ser menor de 4096 caracteres.') as Message

  announcement.translations.push({
    lang,
    title,
    description
  })
  announcement.save()

  interaction.editReply('✅ Se ha añadido la traducción del anuncio.')
}
