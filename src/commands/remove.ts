import { Client, CommandInteraction } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import { Pagination } from 'pagination.djs'

export default async function run (client: Client, interaction: CommandInteraction) {
  const id = interaction.options.getString('name')
  // TODO: Limitar esto a miembros con permisos

  await Announcement.findByIdAndDelete(id).exec()
    .catch(async () => {
      return await interaction.reply({ content: '❌ Se ha producido un error al borrar el comando.', ephemeral: true })
    })
  return await interaction.reply({ content: '✅ Se ha eliminado correctamente el anuncio.', ephemeral: true })
}
