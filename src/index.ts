import 'dotenv/config'
import languages from '@cospired/i18n-iso-languages'
import { ApplicationCommandDataResolvable, Guild, GuildMember, HexColorString, MessageEmbed, Role } from 'discord.js'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import iso from 'iso-639-1'
import mongoose from 'mongoose'
import path from 'node:path'
import config from '../config.json'
import { Announcement } from './schemas/Announcement'
import { Config } from './schemas/Config'
import Client from './structures/Client'
import { getT } from './utils/i18n'

const publish = false
const { guild: developmentGuild, mode: developmentMode } = config.dev

const client = new Client({
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  presence: {
    activities: [{ name: 'Publishing announcements', type: 'PLAYING' }],
    status: 'online'
  }
})
const logger = client.logger

client.once('ready', async (client) => {
  //* Sistema de carga de idiomas
  await i18next.use(Backend).init({
    backend: { loadPath: 'src/lang/{{lng}}/{{ns}}.json' },
    fallbackLng: 'es-ES',
    load: 'currentOnly',
    ns: ['commands', 'common', 'meta']
  })

  //* Sistema de carga de comandos
  let { default: commands }: { default: ApplicationCommandDataResolvable[] } = await import(path.join(__dirname, './commands/index'))
  commands = Object.values(commands)

  const publishCommands = async (commands: ApplicationCommandDataResolvable[]) => {
    if (developmentMode) {
      const guild: Guild = client.guilds.cache.get(developmentGuild)
      if (!guild) return
      const guildCommands = await guild.commands.fetch()
      for (const command of commands) {
        if (guildCommands.get(command.name)?.equals(command) === true) return
        await guild.commands.create(command)
      }
    } else {
      const clientCommands = await client.application?.commands.fetch()
      for (const command of commands) {
        if (clientCommands.get(command.name)?.equals(command) === true) return
        await client.application?.commands.create(command)
      }
    }

    logger.info(`Comandos publicados en ${developmentMode ? 'servidor' : 'global'}`)
    // console.log('client', await client.application?.commands.fetch(), 'guild', await client.guilds.cache.get(devGuild).commands.fetch())
  }

  for (const cmd of commands) {
    // @ts-expect-error
    client.commands.set(cmd.name, cmd)
  }
  if (publish) await publishCommands(commands)

  //* Conección base de datos
  await mongoose.connect(process.env.MONGO_URI ?? '')

  logger.info(`Conectado a ${client.guilds.cache.size as number} servidores`)
})

client.on('guildCreate', (guild) => logger.info(`Nuevo servidor ${guild.name} ${guild.id as string}`))
client.on('guildDelete', (guild) => logger.info(`Salí de servidor ${guild.name} ${guild.id as string}`))

client.on('interactionCreate', async (interaction) => {
  const t = getT(interaction)
  if (interaction.isCommand()) {
    if (!interaction.channel || !interaction.member) return
    const member = interaction.member as GuildMember
    const managerRoles = (await Config.findOne({ guildId: interaction.guildId }))?.managerRoles
    const commandName = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false) ?? interaction.commandName

    if (
      !member.permissions.has('ADMINISTRATOR') &&
      !member.roles.cache.some((role: Role) => managerRoles?.includes(role.id)) &&
      commandName !== 'help'
    ) {
      return await interaction.reply({
        content: t('common:noPerms'),
        ephemeral: true
      })
    }

    const { default: run } = await import(`./commands/${commandName}`)

    run(client, interaction, t)
  }

  if (interaction.isAutocomplete()) {
    const { name: optionName, value: optionValue } = interaction.options.getFocused(true)

    // ? Devolver autocompletado de nombres de anuncios
    if (optionName === 'name') {
      const announcements = await Announcement.find({ guildId: interaction.guildId })
      const result = announcements
        .filter(announcement => announcement.name.toLowerCase().includes(optionValue.toString().toLowerCase()))
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        .map((announcement) => ({ name: announcement.name, value: announcement._id.toString() }))

      return await interaction.respond(result)
    }

    // ? Devolver autocompletado de idiomas
    if (optionName === 'lang') {
      const locales = iso
        .getAllCodes()
        .map(code =>
          ({
            code,
            name: languages.getName(code, interaction.locale.split('-')[0]) ?? iso.getNativeName(code)
          })
        )

      const result = locales
        .filter(locale => locale.name.toLowerCase().includes(optionValue.toString().toLowerCase()))
        .map((locale) => ({ name: locale.name, value: locale.code }))
      if (result.length > 25) result.length = 25

      return await interaction.respond(result)
    }
  }

  // ? Devolver anuncio traducido en ephemeral
  if (interaction.isMessageComponent()) {
    const translationId = interaction.customId

    const announcement = await Announcement.findOne({ 'translations._id': translationId }).exec()
    if (!announcement) return await interaction.reply({ content: t('common:announcementNotFound'), ephemeral: true })

    const translation = announcement
      .translations.find(translation => translation._id?.toString() === translationId)
    if (!translation) return await interaction.reply({ content: t('common:translationNotFound'), ephemeral: true })

    const embed = new MessageEmbed()
      .setColor(announcement.color as HexColorString ?? 'BLURPLE')
    if (translation.title) embed.setTitle(translation.title)
    if (translation.description) embed.setDescription(translation.description)
    if (translation.footer) embed.setFooter({ text: translation.footer })
    if (translation.url && translation.title) embed.setURL(translation.url)

    return await interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
})

client.login(process.env.TOKEN)
  .then(() => {})
  .catch(() => {})
