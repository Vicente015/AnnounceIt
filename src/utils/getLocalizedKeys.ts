
const getCommandKeys = (...parameters: string[]): [string, string] =>
  [`meta:${parameters.join('.')}.name`, `meta:${parameters.join('.')}.description`]

const getOptionDescriptionKey = (optionName: string, ...parameters: string[]): string =>
  `meta:${parameters.join('.')}.options.${optionName}`

export { getCommandKeys, getOptionDescriptionKey }
