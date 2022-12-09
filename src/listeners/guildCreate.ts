import { Listener } from '@sapphire/framework'
import type { Guild } from 'discord.js'

export class GuildCreateListener extends Listener {
  public constructor (context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildCreate'
    })
  }

  public async run (guild: Guild) {
    guild.client.logger.info(`Nuevo servidor ${guild.name} ${guild.id}`)
  }
}
