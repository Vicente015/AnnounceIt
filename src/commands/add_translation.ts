import { CommandInteraction, Message } from 'discord.js'
import { Announcement, AnnouncementType } from '../schemas/Announcement'
import Client from '../structures/Client'
import iso from 'iso-639-1'

export default async function run (client: Client, interaction: CommandInteraction): Promise<Message | void> {
  await interaction.deferReply()
  const id = interaction.options.getString('name')
  const lang = interaction.options.getString('lang', true)
  if (!iso.getNativeName(lang)) return await interaction.reply({ content: '❌ Ese idioma no es válido.', ephemeral: true })
  const title = interaction.options.getString('title', false) ?? undefined

  await interaction.channel!.send('Envíe un mensaje con la descripción, tiene 14 minutos.')
  const msgCollector = await interaction.channel!.awaitMessages({
    filter: (msg) => msg.author.id === interaction.user.id,
    time: 840 * 1000, // 14 minutes
    max: 1
  })
  const description = msgCollector.first()?.content
  if (!description) return await interaction.editReply('❌ Debe introducir una descripción.') as Message
  if (description.length > 4096) return await interaction.editReply('❌ La descripción debe ser menor de 4096 caracteres.') as Message

  const announcement = await Announcement.findById(id).exec()
  if (announcement == null) return await interaction.reply({ content: '❌ No se ha encontrado el anuncio.', ephemeral: true })

  announcement.translations.push({
    lang,
    title,
    description
  })
  // TODO: Hacer comprobación de error en todos los cambios a la db
  announcement.save()

  interaction.editReply('✅ Se ha añadido la traducción del anuncio.')
}
