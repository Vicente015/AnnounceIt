import 'dotenv/config'
import { Listener } from '@sapphire/framework'
import type { Client } from 'discord.js'
import mongoose from 'mongoose'

export class ReadyListener extends Listener {
  public constructor (context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'ready',
      once: true
    })
  }

  public async run (client: Client) {
    await mongoose.connect(process.env.MONGO_URI ?? '')

    client.logger.info(`Conectado a ${client.guilds.cache.size} servidores`)
  }
}
