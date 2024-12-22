/**
 * Gets the command's name and description keys
 * @param parameters
 * @returns
 */
const getCommandKeys = (...parameters: string[]): [`meta:${string}.name`, `meta:${string}.description`] =>
  [`meta:${parameters.join('.')}.name`, `meta:${parameters.join('.')}.description`]

/**
 * Gets the description key of an option
 * @param optionName
 * @param parameters
 * @returns
 */
const getOptionDescriptionKey = (optionName: string, ...parameters: string[]): `meta:${string}.options.${string}` =>
  `meta:${parameters.join('.')}.options.${optionName}`

export { getCommandKeys, getOptionDescriptionKey }
