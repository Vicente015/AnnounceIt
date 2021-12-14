import { ApplicationCommand, Client, Collection } from 'discord.js'

export default class extends Client {
  commands: Collection<string, ApplicationCommand> = new Collection()
}
