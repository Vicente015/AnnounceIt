import { Client, CommandInteraction } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import { TFunction } from 'i18next'

export default async function run (client: Client, interaction: CommandInteraction, t: TFunction) {
  const id = interaction.options.getString('name')

  await Announcement.findByIdAndDelete(id).exec()
    .catch(async () => {
      return await interaction.reply({ content: t('commands:remove.error'), ephemeral: true })
    })
  return await interaction.reply({ content: t('commands:remove.done'), ephemeral: true })
}
