import { Subcommand } from '@sapphire/plugin-subcommands'
import dayjs from 'dayjs'
import UTCPlugin from 'dayjs/plugin/utc.js'
import { GuildTextBasedChannel, PermissionsBitField } from 'discord.js'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement.js'
import { ScheduledPost } from '../../schemas/ScheduledPost.js'
import { buildAnnouncementMessage } from '../../utils/buildAnnouncement.js'
import { reply } from '../../utils/reply.js'
import { validateChatInput } from '../../utils/validateOptions.js'

dayjs.extend(UTCPlugin)

const schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  channel: ow.object,
  date: ow.optional.string.validate((date) => {
    const userDate = dayjs(date)
    const actualDate = dayjs.utc()
    return {
      message: 'commands:publish.errorDateValidation',
      validator: userDate.isValid()
      && userDate.isAfter(actualDate)
      && userDate.isBefore(actualDate.add(1, 'year'))
    }
  })
    .message('commands:publish.errorDateValidation')
})

export async function publish (interaction: Subcommand.ChatInputCommandInteraction) {
  const client = interaction.client
  if (!client.isReady()) return
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { date: scheduledDate, name: id, t } = options
  const channel = options.channel as GuildTextBasedChannel

  if (!channel.permissionsFor(interaction.user.id)?.has(PermissionsBitField.Flags.SendMessages)) {
    return await reply(interaction, { content: t('commands:publish.errorPerms'), type: 'negative' })
  }
  if (!channel.permissionsFor(client.user.id)?.has(PermissionsBitField.Flags.SendMessages)) {
    return await reply(interaction, { content: t('commands:publish.cannotSend'), type: 'negative' })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await reply(interaction, { content: t('commands:publish.announcementNotFound'), type: 'negative' })

  if (scheduledDate) {
    const scheduledPost = new ScheduledPost({
      announcementId: announcement._id,
      at: scheduledDate,
      channelId: channel.id
    })
    await scheduledPost.save()
    await reply(interaction, { content: 'Mensaje programado correctamente.', ephemeral: true, type: 'positive' })
  }
  else {
    await channel.send(buildAnnouncementMessage(announcement, t))
    await Announcement.findByIdAndUpdate(id, { published: true }).exec()
    await reply(interaction, { content: t('commands:publish.done'), ephemeral: true, type: 'positive' })
  }
}
