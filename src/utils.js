export function lowerFirstChar (str) {
  if (typeof str !== 'string') throw new Error('Must provide string')
  return str[0].toLowerCase() + str.slice(1)
}
