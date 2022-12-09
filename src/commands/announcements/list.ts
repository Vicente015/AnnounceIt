import { Subcommand } from '@sapphire/plugin-subcommands'
import ow from 'ow'
import { Pagination } from 'pagination.djs'
import { Announcement } from '../../schemas/Announcement'
import { validateOptions } from '../../utils/validateOptions'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  only_published: ow.optional.boolean
})

export async function list (interaction: Subcommand.ChatInputInteraction<'cached'>) {
  const options = await validateOptions(interaction, Schema)
  if (!options) return
  const { only_published: showPublished, t } = options

  const announcements = await Announcement.find({
    guildId: interaction.guildId,
    published: !!showPublished
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
          title: announcement.title ?? announcement.name
        })
      }))
    )
    .setColor('BLURPLE')

  await pagination.render()
}
