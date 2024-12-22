import { SapphireClient } from '@sapphire/framework'

/**
 * Returns the id of the provided command
 * @param client The client
 * @param commandName The command name
 * @returns The command id
 */
export function getCommandId (client: SapphireClient, commandName: string) {
  if (!client.isReady()) throw new Error('Client not ready')
  const commandStored = client.stores.get('commands').get(commandName)
  if (!commandStored) throw new Error('Command not found')
  return [...commandStored.applicationCommandRegistry.chatInputCommands][1]
}
