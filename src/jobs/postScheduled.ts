import { fetchT } from '@sapphire/plugin-i18next'
import dayjs from 'dayjs'
import type { Client } from 'discord.js'
import { Announcement } from '../schemas/Announcement.js'
import { ScheduledPost } from '../schemas/ScheduledPost.js'
import { buildAnnouncementMessage } from '../utils/buildAnnouncement.js'

export default async function postScheduledJob (client: Client) {
  const pendingPosts = await ScheduledPost.find({
    at: {
      $lte: dayjs.utc().toDate()
    }
  })
  client.logger.debug(`[postScheduled] Posting ${pendingPosts.length} scheduled announcements`)

  for (const post of pendingPosts) {
    try {
      const announcement = await Announcement.findById(post.announcementId).exec()
      if (!announcement) throw new Error('No announcement')
      const channel = await client.channels.fetch(post.channelId)
      if (!channel || !channel.isTextBased()) throw new Error('No channel')
      const t = await fetchT(channel)
      await channel.send(buildAnnouncementMessage(announcement, t))
      await Announcement.findByIdAndUpdate(announcement.id, { published: true }).exec()
    }
    catch (error) {
      client.logger.error('[postScheduled]', error)
      await ScheduledPost.findByIdAndDelete(post.id).exec()
      continue
    }
  }
}
