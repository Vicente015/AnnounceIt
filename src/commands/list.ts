import { Client, CommandInteraction } from 'discord.js'
import { TFunction } from 'i18next'
import { Pagination } from 'pagination.djs'
import { Announcement } from '../schemas/Announcement'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const showPublished = interaction.options.getBoolean('only_published', false) ?? false

  const announcements = await Announcement.find({
    guildId: interaction.guildId,
    published: showPublished
  }).exec()
  if (announcements.length === 0) return await interaction.reply({ content: t('commands:list.notAnnouncements'), ephemeral: true })

  const pagination = new Pagination(interaction, {
    idle: 15 * 1000,
    limit: 4,
    loop: true
  })
    .addFields(
      announcements.map((announcement) => ({
        name: `#${announcement.name}`,
        value: t('commands:list.listValue', {
          color: announcement.color ? t('commands:list.color', { color: announcement.color }) : '',
          published: announcement.published ? t('common:yes') : t('common:no'),
          title: announcement.title
        })
      }))
    )
    .setColor('BLURPLE')

  await pagination.render()
}
