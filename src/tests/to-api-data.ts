import {
  type APIChannel,
  type APIChannelMention,
  type APIDMChannel,
  type APIGuildForumTag,
  type APIMessage,
  type APITextChannel,
  type APIThreadChannel,
  type APIUser,
  type Channel,
  ChannelType,
  type GuildForumTag,
  Message,
  ThreadAutoArchiveDuration,
  User
} from 'discord.js'

export function userToAPIUser (user: User): APIUser {
  return {
    accent_color: user.accentColor,
    avatar: user.avatar,
    banner: user.banner,
    bot: user.bot,
    discriminator: user.discriminator,
    flags: user.flags?.bitfield,
    global_name: user.username,
    id: user.id,
    system: user.system,
    username: user.username
  }
}

export function tagToAPIGuildForumTag (tag: GuildForumTag): APIGuildForumTag {
  return {
    emoji_id: tag.emoji?.id ?? null,
    emoji_name: tag.emoji?.name ?? null,
    id: tag.id,
    moderated: tag.moderated,
    name: tag.name
  }
}

export function channelToAPIChannel (channel: Channel): APIChannel {
  if (channel.isDMBased() && channel.type !== ChannelType.GroupDM) {
    const data: APIDMChannel = {
      flags: channel.flags?.bitfield,
      id: channel.id,
      last_message_id: channel.lastMessageId,
      name: null,
      recipients: [channel.client.user, channel.recipient].map((user) =>
        userToAPIUser(user!)
      ),
      type: channel.type // TODO: Is the bot a recipient?
    }
    return data
  }
  if (channel.isThread()) {
    const data: APIThreadChannel = {
      applied_tags: channel.appliedTags,
      flags: channel.flags?.bitfield,
      guild_id: channel.guild?.id,
      id: channel.id,
      last_message_id: channel.lastMessageId,
      member: undefined,
      member_count: channel.memberCount ?? 0,
      message_count: channel.messageCount ?? 0,
      name: channel.name,
      nsfw: false,
      owner_id: channel.ownerId ?? undefined,
      parent_id: channel.parentId,
      position: 0,
      rate_limit_per_user: channel.rateLimitPerUser ?? 0,
      thread_metadata: {
        archive_timestamp:
          channel.archivedAt?.toISOString()
          ?? channel.createdAt?.toISOString()
          ?? new Date().toISOString(),
        archived: channel.archived ?? false,
        auto_archive_duration:
          channel.autoArchiveDuration ?? ThreadAutoArchiveDuration.OneDay,
        create_timestamp: channel.createdAt?.toISOString(),
        invitable: channel.invitable ?? false,
        locked: channel.locked ?? false
      },
      total_message_sent: channel.totalMessageSent ?? 0,
      type: channel.type // TODO: Define
    }
    return data
  }
  if (channel.type === ChannelType.GuildText) {
    const data: APITextChannel = {
      default_auto_archive_duration: channel.defaultAutoArchiveDuration,
      flags: channel.flags?.bitfield,
      guild_id: channel.guild?.id,
      id: channel.id,
      last_message_id: channel.lastMessageId,
      last_pin_timestamp: channel.lastPinAt?.toISOString(),
      name: channel.name,
      nsfw: channel.nsfw,
      parent_id: channel.parentId,
      permission_overwrites: undefined,
      position: channel.position,
      rate_limit_per_user: channel.rateLimitPerUser,
      topic: channel.topic,
      type: channel.type
    }
    return data
  }
  throw new Error('Channel type not supported')
}

export function channelToAPIChannelMention (
  channel: Channel
): APIChannelMention {
  if (channel.isDMBased()) {
    throw new Error('Cannot mention a DM channel')
  }
  return {
    guild_id: channel.guild.id,
    id: channel.id,
    name: channel.name,
    type: channel.type
  }
}

export function messageToAPIData (message: Message): APIMessage {
  return {
    attachments: [],
    author: userToAPIUser(message.author),
    channel_id: message.channel.id,
    content: message.content,
    edited_timestamp: message.editedAt?.toISOString() ?? null,
    embeds: [],
    flags: message.flags?.bitfield,
    id: message.id,
    mention_channels: message.mentions.channels.map((channel) => channelToAPIChannelMention(channel)),
    mention_everyone: message.mentions.everyone,
    mention_roles: message.mentions.roles.map((role) => role.id),
    mentions: message.mentions.users.map((user) => userToAPIUser(user)),
    nonce: message.nonce ?? undefined,
    pinned: message.pinned,
    position: message.position ?? undefined,
    timestamp: message.createdAt.toISOString(),
    tts: message.tts,
    type: message.type
  }
}
