import 'dotenv/config'
import { Listener } from '@sapphire/framework'
import { Cron } from 'croner'
import type { Client } from 'discord.js'
import mongoose from 'mongoose'
import postScheduledJob from '../jobs/postScheduled.js'
import pruneOldDataJob from '../jobs/pruneOldData.js'

export class ReadyListener extends Listener {
  public constructor (context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'ready',
      once: true
    })
  }

  public async run (client: Client) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI env variable not found')
    await mongoose.connect(process.env.MONGO_URI)

    client.logger.info(`Conectado a ${client.guilds.cache.size} servidores`)

    // # CronJobs
    Cron('* * * * *', async () => postScheduledJob(client))
    Cron('0 0 1 * *', async () => pruneOldDataJob(client))
  }
}
