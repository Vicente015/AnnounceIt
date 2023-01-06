/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { InteractionLimits } from '@sapphire/discord-utilities'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { RouteBases } from 'discord-api-types/v10'
import { HexColorString, MessageActionRowComponentOptions, MessageEmbed, MessageSelectMenuOptions, TextChannel } from 'discord.js'
import iso from 'iso-639-1'
import ow from 'ow'
import { MessageButtonStyles, MessageComponentTypes } from 'discord.js/typings/enums'
import { Announcement } from '../../schemas/Announcement'
import { reply } from '../../utils/reply'
import { validateChatInput } from '../../utils/validateOptions'

const schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  channel: ow.object.instanceOf(TextChannel)
})

// todo: los attachments estos desaparecen, convertir en no efímeros
export const transformToURL = (imageId: string) => `${RouteBases.cdn}/ephemeral-attachments/${imageId}`

export async function publish (interaction: Subcommand.ChatInputInteraction) {
  const client = interaction.client
  if (!client.isReady()) return
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { channel: _, name: id, t } = options
  // todo: implement a better workaround
  const channel = _ as TextChannel

  if (!channel.permissionsFor(interaction.user.id)?.has('SEND_MESSAGES')) {
    return await reply(interaction, { content: t('commands:publish.errorPerms'), type: 'negative' })
  }
  if (!channel.permissionsFor(client.user.id)?.has('SEND_MESSAGES')) {
    return await reply(interaction, { content: t('commands:publish.cannotSend'), type: 'negative' })
  }

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await reply(interaction, { content: t('commands:publish.announcementNotFound'), type: 'negative' })
  const haveTranslations = announcement?.translations.length > 0

  const embed = new MessageEmbed()
    .setColor(announcement.color as HexColorString ?? 'BLURPLE')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)
  if (announcement.footer) embed.setFooter({ text: announcement.footer })
  if (announcement.url && announcement.title) embed.setURL(announcement.url)
  if (announcement.image) embed.setImage(transformToURL(announcement.image))
  if (announcement.thumbnail) embed.setThumbnail(transformToURL(announcement.thumbnail))

  if (haveTranslations) {
    const exceedsButtonLimit = announcement.translations.length > InteractionLimits.MaximumButtonsPerActionRow

    const components = {
      components: exceedsButtonLimit
        ? [{
            customId: `selectLang:${announcement.id}`,
            options: announcement.translations
              .map((translation) => ({ label: iso.getNativeName(translation.lang), value: translation._id!.toString() })),
            placeholder: t('common:selectLang'),
            type: MessageComponentTypes.SELECT_MENU
          } as MessageSelectMenuOptions] as MessageActionRowComponentOptions[]
        : announcement.translations.map((translation) => (
          {
            customId: translation._id!.toString(),
            label: iso.getNativeName(translation.lang),
            style: MessageButtonStyles.SECONDARY,
            type: MessageComponentTypes.BUTTON
          }
        )) as MessageActionRowComponentOptions[],
      type: MessageComponentTypes.ACTION_ROW
    }

    await channel.send({ components: [components], embeds: [embed] })
  } else {
    await channel.send({ embeds: [embed] })
  }

  await Announcement.findByIdAndUpdate(id, { published: true }).exec()
  return await reply(interaction, { content: t('commands:publish.done'), ephemeral: true, type: 'positive' })
}
