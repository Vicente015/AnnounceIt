import { ChatInputCommandSuccessPayload, Listener } from '@sapphire/framework'

export class GuildDeleteListener extends Listener {
  public constructor (context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'chatInputCommandSuccess'
    })
  }

  public async run ({ interaction }: ChatInputCommandSuccessPayload) {
    interaction.client.logger.info(`Comando ejecutado /${interaction.commandName}`)
  }
}
