import { SapphireClient } from '@sapphire/framework'

export function getCommandId (client: SapphireClient, commandName: string) {
  return [...client.stores.get('commands').get(commandName).applicationCommandRegistry.chatInputCommands][1] as string
}
