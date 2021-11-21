import "dotenv/config"
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CommandInteraction } from "discord.js"
import Client from "./structures/Client"
import mongoose from "mongoose"

const publish = false
const DEV_GUILD = '909070968360685598'

const client: Client = new Client({
  intents: ['GUILDS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES']
})

client.once('ready', async (client) => {
  //* Sistema de carga de comandos
  let commands = readdirSync(join(__dirname, `./commands/`))
    .filter(file => file.startsWith('index') && file.endsWith('.js'))

  for (let command of commands) {
    const { default: cmd } = await import(join(__dirname, `./commands/${command}`))
    
    if (publish) client.guilds.cache.get(DEV_GUILD).commands.create(cmd)

    // @ts-expect-error
    client.commands.set(cmd.name, cmd)
  }

  //* Conección base de datos
  await mongoose.connect(process.env.MONGO_URI)

  /*
  // @ts-expect-error
  client.mongoose = mongoose
  */

  console.log('Conectado!')
})

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  let subCommandName = interaction.options.getSubcommand(false)

  const { default: run } = await import(`./commands/${subCommandName}`)

  run(client, interaction)
})

client.login(process.env.TOKEN)