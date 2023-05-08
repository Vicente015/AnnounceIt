
import { Command } from '@sapphire/framework'
import { applyLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, chatInputApplicationCommandMention, ColorResolvable, EmbedBuilder, ImageFormat } from 'discord.js'
import config from '../../config.json'
import { getCommandId } from '../utils/getCommandId'
import { getCommandKeys } from '../utils/getLocalizedKeys'

export class HelpCommand extends Command {
  public constructor (context: Command.Context, options: Command.Options) {
    super(context, {
      ...options
    })
  }

  public override registerApplicationCommands (registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      applyLocalizedBuilder(builder, ...getCommandKeys('help'))
        .setDMPermission(true)
    )
  }

  public async chatInputRun (interaction: Command.ChatInputCommandInteraction) {
    const client = interaction.client
    if (!client.isReady()) return
    const t = await fetchT(interaction)
    const announcementsCommandId = getCommandId(client, 'announcements')

    const embed = new EmbedBuilder()
      .setTitle(client.user.username)
      .setDescription(t('commands:help.description', {
        add_command: chatInputApplicationCommandMention('announcements add', announcementsCommandId),
        add_translation_command: chatInputApplicationCommandMention('announcements add_translation', announcementsCommandId),
        publish_command: chatInputApplicationCommandMention('announcements publish', announcementsCommandId),
        username: client.user.username
      }))
      .setColor(config.colors.neutral as ColorResolvable)
      .setThumbnail(client.user.displayAvatarURL({ extension: ImageFormat.PNG, size: 512 }))

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(t('commands:help.invite'))
          .setEmoji('<:add:847563585165066290>')
          .setURL('https://discord.com/api/oauth2/authorize?client_id=725373172391739402&permissions=274878221312&scope=bot')
          .setStyle(ButtonStyle.Link)
      )

    return await interaction.reply({ components: [buttons], embeds: [embed] })
  }
}
