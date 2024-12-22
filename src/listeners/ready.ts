import '../environment.js'
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
    const MONGO_URI = globalThis.__MONGO_URI__ ?? process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTING : process.env.MONGO_URI
    if (!MONGO_URI) throw new Error('MONGO_URI not found')
    await mongoose.connect(MONGO_URI)

    client.logger.info(`Conectado a ${client.guilds.cache.size} servidores`)
    client.logger.debug(`Conectado a Mongo ${mongoose.connection.host}:${mongoose.connection.port} ${mongoose.connection.name}`)

    // # CronJobs
    new Cron('* * * * *', async () => postScheduledJob(client))
    new Cron('0 0 1 * *', async () => pruneOldDataJob(client))
  }
}
