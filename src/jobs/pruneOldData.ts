import { Client } from 'discord.js'
import { Announcement } from '../schemas/Announcement.js'

export default async function pruneOldDataJob (client: Client) {
  const currentGuilds = client.guilds.cache.map((guild) => guild.id)

  const removeOldAnnouncements = await Announcement.deleteMany({
    guildId: { $not: { $in: currentGuilds } }
  }).exec()
  client.logger.debug(`[pruneOldDataJob] Pruned ${removeOldAnnouncements.deletedCount} old announcements`)
}
