import { Client, Guild, GuildMember, PermissionFlagsBits } from 'discord.js'
import { mockGuild } from './guild-mock.js'
import { mockGuildMember } from './user-mock.js'

export type GuildMemberVariants = Awaited<
  ReturnType<typeof createGuildMemberVariants>
>

export async function createGuildMemberVariants (
  client: Client,
  guild: Guild | undefined = undefined
): Promise<{
  guildMemberOwner: GuildMember
  guildMemberDefault: GuildMember
  pendingGuildMemberDefault: GuildMember
  guildMemberManageGuild: GuildMember
  guildMemberAdmin: GuildMember
}> {
  if (!guild) guild = mockGuild(client)
  const guildMemberOwner = await guild.members.fetch(guild.ownerId)
  const guildMemberDefault = mockGuildMember({ client, guild })
  const pendingGuildMemberDefault = mockGuildMember({
    client,
    data: {
      pending: true
    },
    guild
  })
  const guildMemberManageGuild = mockGuildMember({
    client,
    guild,
    permissions: PermissionFlagsBits.ManageGuild
  })
  const guildMemberAdmin = mockGuildMember({
    client,
    guild,
    permissions: PermissionFlagsBits.Administrator
  })

  return {
    guildMemberAdmin,
    guildMemberDefault,
    guildMemberManageGuild,
    guildMemberOwner,
    pendingGuildMemberDefault
  }
}
