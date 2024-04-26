import { ChatInputCommandErrorPayload, Listener } from '@sapphire/framework'

export class GuildDeleteListener extends Listener {
  public constructor (context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'chatInputCommandError'
    })
  }

  public run ({ duration, interaction }: ChatInputCommandErrorPayload) {
    interaction.client.logger.error('Error al ejecutar comando', interaction.commandName, duration)
  }
}
