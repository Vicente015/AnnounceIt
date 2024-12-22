import { InteractionLimits } from '@sapphire/discord-utilities'
import { TFunction } from '@sapphire/plugin-i18next'
import { ButtonComponentData, ButtonStyle, ComponentType, EmbedBuilder, MessageCreateOptions, StringSelectMenuComponentData } from 'discord.js'
import iso from 'iso-639-1'
import { AnnouncementType } from '../schemas/Announcement.js'
import convertHexStringToInt from './convertHexStringToInt.js'

const buildAnnouncementEmbed = (announcement: AnnouncementType) => {
  const embed = new EmbedBuilder()
    .setColor(convertHexStringToInt(announcement.color) ?? 'Blurple')

  if (announcement.title) embed.setTitle(announcement.title)
  if (announcement.description) embed.setDescription(announcement.description)
  if (announcement.footer) embed.setFooter({ text: announcement.footer })
  if (announcement.url && announcement.title) embed.setURL(announcement.url)
  if (announcement.image) embed.setImage(announcement.image)
  if (announcement.thumbnail) embed.setThumbnail(announcement.thumbnail)
  return embed
}

const buildAnnouncementComponents = (announcement: AnnouncementType, t: TFunction) => {
  const exceedsButtonLimit = announcement.translations.length > InteractionLimits.MaximumButtonsPerActionRow

  const components = {
    components: exceedsButtonLimit
      ? [{
          customId: `selectLang:${announcement._id}`,
          options: announcement.translations
            .map((translation) => ({ label: iso.getNativeName(translation.lang), value: translation._id?.toString() })),
          placeholder: t('common:selectLang'),
          type: ComponentType.StringSelect
        }] as StringSelectMenuComponentData[]
      : announcement.translations.map((translation) => (
        {
          customId: translation._id?.toString(),
          label: iso.getNativeName(translation.lang),
          style: ButtonStyle.Secondary,
          type: ComponentType.Button
        }
      )) as ButtonComponentData[],
    type: ComponentType.ActionRow
  }
  return components
}

const buildAnnouncementMessage = (announcement: AnnouncementType, t: TFunction): MessageCreateOptions => {
  const embed = buildAnnouncementEmbed(announcement)
  const hasTranslations = announcement?.translations.length > 0

  if (hasTranslations) {
    const components = buildAnnouncementComponents(announcement, t)
    return { components: [components], embeds: [embed] }
  }

  return { embeds: [embed] }
}

export {
  buildAnnouncementComponents,
  buildAnnouncementEmbed,
  buildAnnouncementMessage
}
