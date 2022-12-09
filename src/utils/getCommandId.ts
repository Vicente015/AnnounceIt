import { SapphireClient } from '@sapphire/framework'

/**
 * Returns the id of the provided command
 * @param client The client
 * @param commandName The command name
 * @returns The command id
 */
export function getCommandId (client: SapphireClient, commandName: string) {
  return [...client.stores.get('commands').get(commandName).applicationCommandRegistry.chatInputCommands][1] as string
}
