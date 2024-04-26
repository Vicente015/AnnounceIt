import 'dotenv/config'
import { Listener } from '@sapphire/framework'
import { Cron } from 'croner'
import type { Client } from 'discord.js'
import mongoose from 'mongoose'
import postScheduledJob from '../jobs/postScheduled.js'

export class ReadyListener extends Listener {
  public constructor (context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'ready',
      once: true
    })
  }

  public async run (client: Client) {
    await mongoose.connect(process.env.MONGO_URI ?? '')

    client.logger.info(`Conectado a ${client.guilds.cache.size} servidores`)

    Cron('* * * * *', async () => postScheduledJob(client))
  }
}
