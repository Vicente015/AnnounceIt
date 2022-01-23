import 'dotenv/config'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { AutocompleteInteraction, CommandInteraction, HexColorString, MessageEmbed } from 'discord.js'
import Client from './structures/Client'
import mongoose from 'mongoose'
import iso from 'iso-639-1'
import { Announcement } from './schemas/Announcement'
import pino from 'pino'
import languages from '@cospired/i18n-iso-languages'

const logger = pino()
const publish = false
const devMode = false
const DEV_GUILD = '909070968360685598'

const client: Client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
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

  if (publish && !devMode) await client.application.commands.set([])
  for (const command of commands) {
    const { default: cmd } = await import(join(__dirname, `../dist/commands/${command}`))

    if (publish) {
      if (devMode) {
        const guild = client.guilds.cache.get(DEV_GUILD)
        if (guild == null) return
        await guild.commands.set([])
        guild.commands.create(cmd)
      } else {
        await client.application.commands.create(cmd)
      }
    }

    // @ts-expect-error
    client.commands.set(cmd.name, cmd)
  }

  //* Conección base de datos
  // @ts-expect-error
  await mongoose.connect(process.env.MONGO_URI)

  logger.info(`Conectado a ${client.guilds.cache.size} servidores`)
  console.log(await client.application.commands.fetch())
})

client.on('guildCreate', (guild) => logger.info(`Nuevo servidor ${guild.name} ${guild.id}`))
client.on('guildDelete', (guild) => logger.info(`Salí de servidor ${guild.name} ${guild.id}`))

// @ts-expect-error
client.on('interactionCreate', async (interaction: CommandInteraction | AutocompleteInteraction) => {
  if (interaction.isCommand()) {
    if (interaction.channel == null) return
    const subCommandName = interaction.options.getSubcommand(false)
    const { default: run } = await import(`../dist/commands/${subCommandName}`)

    run(client, interaction)
  }

  if (interaction.isAutocomplete()) {
    const { name: optionName, value: optionValue } = interaction.options.getFocused(true)

    // ? Devolver autocompletado de nombres de anuncios
    if (optionName === 'name') {
      const announcements = await Announcement.find({ guildId: interaction.guildId })
      const res = announcements
        .filter(announcement => announcement.name.includes(optionValue.toString()))
        .map((announcement) => ({ name: announcement.name, value: announcement._id.toString() }))

      return await interaction.respond(res)
    }

    // ? Devolver autocompletado de idiomas
    if (optionName === 'lang') {
      const locales = iso
        .getAllCodes()
        .map(code =>
          ({
            name: languages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code),
            code: code
          })
        )

      const res = locales
        .filter(locale => locale.name.toLowerCase().includes(optionValue.toString()))
        .map((locale) => ({ name: locale.name, value: locale.code }))
      if (res.length > 25) res.length = 25

      return await interaction.respond(res)
    }
  }

  // ? Devolver anuncio traducido en ephemeral
  if (interaction.isMessageComponent()) {
    const translationId = interaction.customId

    const announcement = await Announcement.findOne({ 'translations._id': translationId }).exec()
    if (announcement == null) return await interaction.reply({ content: '❌ No se ha encontrado el anuncio.', ephemeral: true })

    const translation = announcement
      .translations.find(translation => translation._id?.toString() === translationId)
    if (translation == null) return await interaction.reply({ content: '❌ Error, no se ha encontrado la traducción.', ephemeral: true })

    const embed = new MessageEmbed()
      .setColor(announcement.color as HexColorString ?? 'BLURPLE')
    if (translation.title) embed.setTitle(translation.title)
    if (translation.description) embed.setDescription(translation.description)

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
})

client.login(process.env.TOKEN)
