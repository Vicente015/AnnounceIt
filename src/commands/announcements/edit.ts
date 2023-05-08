import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { ActionRowBuilder, ComponentType, ModalBuilder } from 'discord.js'
import iso from 'iso-639-1'
import ow from 'ow'
import { Announcement } from '../../schemas/Announcement'
import getModalComponents from '../../utils/getModalComponents'
import { reply } from '../../utils/reply'
import { validateChatInput } from '../../utils/validateOptions'

const schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string,
  lang: ow.optional.string.oneOf(iso.getAllCodes()).message(() => 'commands:add-translation.notValidLanguage')
})

export async function edit (interaction: Subcommand.ChatInputCommandInteraction) {
  const t: TFunction = await fetchT(interaction)
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { lang, name: id } = options

  const announcement = await Announcement.findById(id).exec().catch(() => {})
  if (!announcement) return await reply(interaction, { content: t('commands:publish.announcementNotFound'), type: 'negative' })
  const translation = lang ? announcement.translations.find((translation) => translation.lang === lang) : undefined
  const target = translation ?? announcement

  const modal = new ModalBuilder()
    .setTitle(t('commands:edit.modalTitle'))
    .setCustomId(`editAnnouncement:${interaction.id}:${Date.now()}:${JSON.stringify([id, lang])}`)

  let components = (await getModalComponents(interaction, !!lang))

  // ? Add values from announcement to modal components
  components = components.map((component) => ({
    ...component,
    // @ts-expect-error
    value: target[component.customId]
  }))

  modal.setComponents(
    // ? Makes an actionRow for every textInput
    components
      .map((component) => new ActionRowBuilder({
        components: [component],
        type: ComponentType.ActionRow
      }))
  )

  try {
    await interaction.showModal(modal)
  } catch (error) {
    interaction.client.logger.error(error)
  }
}
