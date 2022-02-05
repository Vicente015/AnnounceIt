import 'dotenv/config'
import { join } from 'node:path'
import { Announcement } from './schemas/Announcement'
import { ApplicationCommandDataResolvable, AutocompleteInteraction, CommandInteraction, Guild, GuildMember, HexColorString, MessageEmbed, Role } from 'discord.js'
import { Config } from './schemas/Config'
import { getT } from './utils/i18n'
import Client from './structures/Client'
import mongoose from 'mongoose'
import iso from 'iso-639-1'
import languages from '@cospired/i18n-iso-languages'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import config from '../config.json'

const publish = false
const { mode: devMode, guild: devGuild } = config.dev

const client: Client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
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
  let { default: cmds }: { default: ApplicationCommandDataResolvable[] } = await import(join(__dirname, './commands/index'))
  cmds = Object.values(cmds)

  const publishCommands = async (commands: ApplicationCommandDataResolvable[]) => {
    if (devMode) {
      const guild: Guild = client.guilds.cache.get(devGuild)
      if (!guild) return
      const guildCommands = await guild.commands.fetch()
      commands.forEach(command => {
        if (guildCommands.get(command.name)?.equals(command) === true) return
        guild.commands.create(command)
      })
    } else {
      const clientCommands = await client.application?.commands.fetch()
      commands.forEach(command => {
        if (clientCommands.get(command.name)?.equals(command) === true) return
        client.application?.commands.create(command)
      })
    }

    logger.info(`Comandos publicados en ${devMode ? 'servidor' : 'global'}`)
    // console.log('client', await client.application?.commands.fetch(), 'guild', await client.guilds.cache.get(devGuild).commands.fetch())
  }

  for (const cmd of cmds) {
    // @ts-expect-error
    client.commands.set(cmd.name, cmd)
  }
  if (publish) await publishCommands(cmds)

  //* Conección base de datos
  // @ts-expect-error
  mongoose.connect(process.env.MONGO_URI)

  logger.info(`Conectado a ${client.guilds.cache.size} servidores`)
})

client.on('guildCreate', (guild) => logger.info(`Nuevo servidor ${guild.name} ${guild.id}`))
client.on('guildDelete', (guild) => logger.info(`Salí de servidor ${guild.name} ${guild.id}`))

// @ts-expect-error
client.on('interactionCreate', async (interaction: CommandInteraction | AutocompleteInteraction) => {
  const t = getT(interaction)
  if (interaction.isCommand()) {
    if ((interaction.channel == null) || (interaction.member == null)) return
    const member = interaction.member as GuildMember
    const managerRoles = (await Config.findOne({ guildId: interaction.guildId }))?.managerRoles
    const commandName = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false) ?? interaction.commandName

    if (
      !member.permissions.has('ADMINISTRATOR') &&
      !member.roles.cache.find((role: Role) => managerRoles?.includes(role.id)) &&
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
      const res = announcements
        .filter(announcement => announcement.name.toLowerCase().includes(optionValue.toString().toLowerCase()))
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
        .filter(locale => locale.name.toLowerCase().includes(optionValue.toString().toLowerCase()))
        .map((locale) => ({ name: locale.name, value: locale.code }))
      if (res.length > 25) res.length = 25

      return await interaction.respond(res)
    }
  }

  // ? Devolver anuncio traducido en ephemeral
  if (interaction.isMessageComponent()) {
    const translationId = interaction.customId

    const announcement = await Announcement.findOne({ 'translations._id': translationId }).exec()
    if (announcement == null) return await interaction.reply({ content: t('common:announcementNotFound'), ephemeral: true })

    const translation = announcement
      .translations.find(translation => translation._id?.toString() === translationId)
    if (translation == null) return await interaction.reply({ content: t('common:translationNotFound'), ephemeral: true })

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
