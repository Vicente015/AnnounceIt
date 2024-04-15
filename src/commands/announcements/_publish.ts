/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { InteractionLimits } from '@sapphire/discord-utilities'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { ButtonStyle, ComponentType, EmbedBuilder, GuildTextBasedChannel, PermissionsBitField } from 'discord.js'
import iso from 'iso-639-1'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement.js'
import convertHexStringToInt from '../../utils/convertHexStringToInt.js'
import { reply } from '../../utils/reply.js'
import { validateChatInput } from '../../utils/validateOptions.js'

const schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  channel: ow.object
})

export async function publish (interaction: Subcommand.ChatInputCommandInteraction) {
  const client = interaction.client
  if (!client.isReady()) return
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { name: id, t } = options
  const channel = options.channel as GuildTextBasedChannel

  if (!channel.permissionsFor(interaction.user.id)?.has(PermissionsBitField.Flags.SendMessages)) {
    return await reply(interaction, { content: t('commands:publish.errorPerms'), type: 'negative' })
  }
  if (!channel.permissionsFor(client.user.id)?.has(PermissionsBitField.Flags.SendMessages)) {
    return await reply(interaction, { content: t('commands:publish.cannotSend'), type: 'negative' })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => { return })
  if (!announcement) return await reply(interaction, { content: t('commands:publish.announcementNotFound'), type: 'negative' })
  const haveTranslations = announcement?.translations.length > 0

  const embed = new EmbedBuilder()
    .setColor(convertHexStringToInt(announcement.color) ?? 'Blurple')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)
  if (announcement.footer) embed.setFooter({ text: announcement.footer })
  if (announcement.url && announcement.title) embed.setURL(announcement.url)
  if (announcement.image) embed.setImage(announcement.image)
  if (announcement.thumbnail) embed.setThumbnail(announcement.thumbnail)

  if (haveTranslations) {
    const exceedsButtonLimit = announcement.translations.length > InteractionLimits.MaximumButtonsPerActionRow

    const components = {
      components: exceedsButtonLimit
        ? [{
            customId: `selectLang:${announcement.id}`,
            options: announcement.translations
              .map((translation) => ({ label: iso.getNativeName(translation.lang), value: translation._id?.toString() })),
            placeholder: t('common:selectLang'),
            type: ComponentType.StringSelect
          }]
        : announcement.translations.map((translation) => (
          {
            customId: translation._id?.toString(),
            label: iso.getNativeName(translation.lang),
            style: ButtonStyle.Secondary,
            type: ComponentType.Button
          }
        )),
      type: ComponentType.ActionRow
    }

    await channel.send({ components: [components], embeds: [embed] })
  } else {
    await channel.send({ embeds: [embed] })
  }

  await Announcement.findByIdAndUpdate(id, { published: true }).exec()
  return await reply(interaction, { content: t('commands:publish.done'), ephemeral: true, type: 'positive' })
}
