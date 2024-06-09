import { ActionRowBuilder, ComponentType, TextInputBuilder, TextInputComponentData } from 'discord.js'

/**
 * Creates an ActionRow for each TextInput component in the provided array
 * @param components
 * @returns
 */
function actionRowForEachComponent (components: TextInputComponentData[]) {
  return components
    .map((component) => new ActionRowBuilder<TextInputBuilder>({
      components: [{ ...component, type: ComponentType.TextInput }],
      type: ComponentType.ActionRow
    }))
}

export default actionRowForEachComponent
