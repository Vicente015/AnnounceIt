import {
  type APIGuildMember,
  Client,
  ClientUser,
  Guild,
  GuildMember,
  GuildMemberFlags,
  type PermissionResolvable,
  PermissionsBitField,
  User
} from 'discord.js'
import { RawUserData } from 'discord.js/typings/rawDataTypes.js'
import { randomSnowflake } from '../utils/Snowflake.js'
import { mockGuild, mockRole } from './guild-mock.js'

export function mockUser (client: Client, data: Partial<RawUserData> = {}) {
  const rawData: RawUserData = {
    avatar: 'user avatar url',
    bot: false,
    discriminator: 'user#0000',
    id: randomSnowflake().toString(),
    username: 'USERNAME',
    ...data
  }
  const user = Reflect.construct(User, [client, rawData]) as User
  client.users.cache.set(user.id, user)
  return user
}

export function mockClientUser (
  client: Client,
  override: Partial<RawUserData> = {}
) {
  const rawData: RawUserData = {
    avatar: null,
    bot: false,
    discriminator: '0000',
    id: process.env.DISCORD_CLIENT_ID ?? randomSnowflake().toString(),
    username: 'test',
    ...override
  }
  const clientUser = Reflect.construct(ClientUser, [
    client,
    rawData
  ]) as ClientUser
  client.user = clientUser
  client.user.id = rawData.id
  return clientUser
}

export function mockGuildMember (input: {
  client: Client
  user?: User
  guild?: Guild
  permissions?: PermissionResolvable
  data?: Partial<APIGuildMember>
}) {
  const {
    client,
    data = {},
    permissions = PermissionsBitField.Default
  } = input
  let { guild, user } = input
  if (!user) {
    user = mockUser(client)
  }
  if (!guild) {
    guild = mockGuild(client, user) // By default make the guild owner the user
  }

  // Create a custom role that represents the permission the user has
  const role = mockRole(client, permissions, guild)

  const rawData: APIGuildMember = {
    deaf: false,
    flags: GuildMemberFlags.CompletedOnboarding,
    joined_at: '33',
    mute: false,
    roles: [role.id],
    user: {
      avatar: user.avatar,
      discriminator: user.discriminator,
      global_name: user.username,
      id: user.id,
      username: user.username
    },
    ...data
  }

  const member = Reflect.construct(GuildMember, [
    client,
    rawData,
    guild
  ]) as GuildMember
  guild.members.cache.set(member.id, member)
  return member
}
