import { ApplicationCommand, Client, Collection } from 'discord.js'
import pino from 'pino'
import config from '../../config.json'

export default class extends Client {
  public commands: Collection<string, ApplicationCommand> = new Collection()
  public logger: pino.Logger = pino({
    level: config.debug ? 'debug' : 'info'
  })
}
