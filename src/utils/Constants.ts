import { ChannelType } from 'discord.js'

const TextBasedChannels = [
  ChannelType.GuildText,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread
] as const

export { TextBasedChannels }
