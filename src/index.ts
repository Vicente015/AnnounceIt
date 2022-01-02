import 'dotenv/config'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { AutocompleteInteraction, CommandInteraction, MessageEmbed } from 'discord.js'
import Client from './structures/Client'
import mongoose from 'mongoose'
import iso from 'iso-639-1'
import Announcement from './schemas/Announcement'

const publish = false
const DEV_GUILD = '909070968360685598'

const client: Client = new Client({
  intents: ['GUILDS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_MESSAGES'],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
  presence: {
    activities: [{ name: 'Publishing announcements', type: 'PLAYING' }],
    status: 'online'
  }
})

client.once('ready', async (client) => {
  //* Sistema de carga de comandos
  const commands = readdirSync(join(__dirname, '../dist/commands/'))
    .filter(file => file.startsWith('index') && file.endsWith('.js'))

  for (const command of commands) {
    const { default: cmd } = await import(join(__dirname, `../dist/commands/${command}`))

    if (publish) {
      await client.guilds.cache.get(DEV_GUILD).commands.set([])
      client.guilds.cache.get(DEV_GUILD).commands.create(cmd)
    }

    // @ts-expect-error
    client.commands.set(cmd.name, cmd)
  }

  //* Conección base de datos
  await mongoose.connect(process.env.MONGO_URI)

  console.log('Conectado!')
})

// @ts-expect-error
client.on('interactionCreate', async (interaction: CommandInteraction | AutocompleteInteraction) => {
  if (interaction.isCommand()) {
    const subCommandName = interaction.options.getSubcommand(false)
    const { default: run } = await import(`../dist/commands/${subCommandName}`)

    run(client, interaction)
  }
  if (interaction.isAutocomplete()) {
    const value = interaction.options.getFocused()
    const names = iso.getAllNativeNames()

    const res = names
      .filter(name => name.includes(value.toString()))
      .map((name) => ({ name: name, value: iso.getCode(name) }))

    if (res.length > 25) res.length = 25

    return await interaction.respond(res)
  }
  if (interaction.isMessageComponent()) {
    const translationId = interaction.customId

    const announcement = await Announcement.findOne({ 'translations._id': translationId }).exec()
    const translation = announcement
      .translations.find(translation => translation._id.toString() === translationId)

    const embed = new MessageEmbed()
      .setColor(announcement.color)
    if (translation.title) embed.setTitle(translation.title)
    if (translation.description) embed.setDescription(translation.description)

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
})

client.login(process.env.TOKEN)
