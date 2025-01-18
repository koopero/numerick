
import { NumerickConfig } from "./types"
import { numberToNorm, normToNumber } from "./normal"
import { numberFormat } from "./format"
import { parseValue } from "./parse"

export function stringToNorm(str: string, config: NumerickConfig = {}):number {
  const value = stringToNumber(str, config)
  return numberToNorm(value, config)
}

export function normToString(value: number, config: NumerickConfig = {}):string {
  value = normToNumber(value, config)
  return numberToString(value, config)
}

export function numberToString(value: number, config: NumerickConfig = {}):string {
  return numberFormat(value, config).join("")
}

export function stringToNumber(
  str: string,
  config: NumerickConfig = {}
): number {
  const { value } = parseValue(str, config)
  return value
}
