import { ApplicationCommandOptionAllowedChannelTypes } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10'

const TextBasedChannels: ApplicationCommandOptionAllowedChannelTypes[] = [
  ChannelType.GuildText,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread
]

export { TextBasedChannels }
