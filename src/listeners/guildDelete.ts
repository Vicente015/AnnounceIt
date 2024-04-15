import { Listener } from '@sapphire/framework'
import type { Guild } from 'discord.js'

export class GuildDeleteListener extends Listener {
  public constructor (context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildDelete'
    })
  }

  public run (guild: Guild) {
    guild.client.logger.info(`Expulsado de servidor ${guild.name} ${guild.id}`)
  }
}
