import { Listener } from '@sapphire/framework'
import type { Guild } from 'discord.js'

export class GuildCreateListener extends Listener {
  public constructor (context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'guildCreate'
    })
  }

  public run (guild: Guild) {
    guild.client.logger.info(`Nuevo servidor ${guild.name} ${guild.id}`)
  }
}
