import {
  type APIGuild,
  Client,
  Guild,
  GuildSystemChannelFlags,
  type PermissionResolvable,
  PermissionsBitField,
  Role,
  RoleFlagsBitField,
  User
} from 'discord.js'
import type { RawRoleData } from 'discord.js/typings/rawDataTypes.js'
import { randomSnowflake } from '../utils/Snowflake.js'
import { mockGuildMember, mockUser } from './user-mock.js'

export function mockGuild (
  client: Client,
  owner?: User,
  data: Partial<APIGuild> = {}
) {
  // Create the guild
  if (!owner) {
    owner = mockUser(client)
  }
  const guildId = data.id ?? randomSnowflake().toString()
  const rawData: APIGuild = {
    afk_channel_id: null,
    afk_timeout: 60,
    application_id: null,
    banner: 'guild banner url',
    default_message_notifications: 0,
    description: 'guild description',
    discovery_splash: 'guild discovery splash url',
    emojis: [],
    explicit_content_filter: 0,
    features: [],
    hub_type: 0,
    icon: 'guild icon url',
    id: guildId,
    mfa_level: 0,
    name: 'guild name',
    nsfw_level: 0,
    owner_id: owner.id,
    preferred_locale: '',
    premium_progress_bar_enabled: false,
    premium_tier: 0,
    public_updates_channel_id: null,
    region: '',
    roles: [],
    rules_channel_id: null,
    safety_alerts_channel_id: null,
    splash: 'guild splash url',
    stickers: [],
    system_channel_flags: GuildSystemChannelFlags.SuppressPremiumSubscriptions,
    system_channel_id: null,
    vanity_url_code: null,
    verification_level: 0
    // ...omit(data, 'id')
  }
  const guild = Reflect.construct(Guild, [client, rawData]) as Guild

  // Create the default role
  mockRole(client, PermissionsBitField.Default, guild, {
    id: guild.id,
    name: 'everyone'
  })

  // Update client cache
  client.guilds.cache.set(guild.id, guild)
  mockGuildMember({ client, guild, user: owner })
  mockGuildMember({ client, guild, user: client.user! }) // it is expected that the bot is a member of the guild

  // replace guild members fetched with accessing from the cache of the fetched user id in the fetch argument
  // TODO: Remove tsignore
  // @ts-expect-error dsdsds
  guild.members.fetch = (
    id:
      | string
      | { user: string }
  ) => {
    if (typeof id === 'object') {
      id = id.user
    }
    const member = guild.members.cache.get(id)
    if (member) return member
    throw new Error('Member not found')
  }

  return guild
}

export function mockRole (
  client: Client,
  permissions: PermissionResolvable,
  guild?: Guild,
  role: Partial<RawRoleData> = {}
) {
  if (!guild) {
    guild = mockGuild(client)
  }
  const roleData: RawRoleData = {
    color: 0,
    flags: RoleFlagsBitField.Flags.InPrompt,
    hoist: false,
    id: randomSnowflake().toString(),
    managed: false,
    mentionable: false,
    name: 'test',
    permissions: PermissionsBitField.resolve(permissions).toString(),
    position: 0,
    ...role
  }
  const createdRole = Reflect.construct(Role, [
    client,
    roleData,
    guild
  ]) as Role
  guild.roles.cache.set(createdRole.id, createdRole)
  return createdRole
}
