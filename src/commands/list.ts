import { Client, CommandInteraction } from 'discord.js'
import { Announcement } from '../schemas/Announcement'
import { Pagination } from 'pagination.djs'
import { TFunction } from 'i18next'

export default async function run (client: Client, interaction: CommandInteraction<'cached'>, t: TFunction): Promise<void> {
  const showPublished = interaction.options.getBoolean('only_published', false) ?? false

  const announcements = await Announcement.find({
    guildId: interaction.guildId,
    published: showPublished
  }).exec()
  if (announcements.length < 1) return await interaction.reply({ content: t('commands:list.notAnnouncements'), ephemeral: true })

  const pagination = new Pagination(interaction, {
    limit: 4,
    idle: 15 * 1000,
    loop: true
  })
    .addFields(
      announcements.map((announcement) => ({
        name: `#${announcement.name}`,
        value: t('commands:list.listValue', {
          title: announcement.title,
          published: announcement.published ? t('common:yes') : t('common:no'),
          color: announcement.color !== null ? t('commands:list.color', { color: announcement.color }) : ''
        })
      }))
    )
    .setColor('BLURPLE')

  await pagination.render()
}
