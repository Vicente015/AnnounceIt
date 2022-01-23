import { Client, CommandInteraction } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import { Pagination } from 'pagination.djs'

export default async function run (client: Client, interaction: CommandInteraction) {
  const showPublished = interaction.options.getBoolean('only_published', false) ?? false

  console.log(showPublished)
  const announcements = await Announcement.find({
    guildId: interaction.guildId,
    published: showPublished
  }).exec()
  if (announcements.length < 1) return await interaction.reply({ content: '❌ No tiene ningún anuncio, cree uno con  `/announcements add`.', ephemeral: true })

  const pagination = new Pagination(interaction, {
    limit: 4,
    idle: 15 * 1000,
    loop: true
  })
    .addFields(
      announcements.map((announcement) => ({
        name: `#${announcement.name}`,
        value: `Título: ${announcement.title}\nPublicado: ${announcement.published ? 'Sí' : 'No'}${(announcement.color != null) ? `\nColor: ${announcement.color}` : ''}`
      }))
    )
    .setColor('BLURPLE')

  pagination.render()
}
