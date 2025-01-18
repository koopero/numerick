export type MatchCharacter = boolean | string | RegExp | Array<string | RegExp>
export type MatchUnit = boolean | string | Array<string> | RegExp | Array<MatchUnit>

export type RadixMap = { [key: string]: number }

export interface NumerickConfig {
  min?: number
  max?: number
  origin?: number
  step?: number
  quant?: number
  clamp?: boolean
  bias?: number
  logarithmic?: boolean

  deadzone?: number
  expo?: number

  length?: number
  digits?: number
  prefix?: false | string | string[] | RegExp
  radix?: number
  radixPrefix?: false | { [key: string]: number }
  precision?: number
  precisionMax?: number

  padStart?: boolean
  padZero?: boolean
  padString?: string
  zeroString?: string
  signZero?: boolean
  nanString?: string
  infinityString?: string
  nanValue?: number

  scientific?: boolean
  scientificString?: string
  scientificMin?: number
  scientificMax?: number

  metric?: boolean
  metricFudge?: number
  metricScale?: object
  metricMin?: number
  metricMax?: number
  metricPad?: number

  unit?: MatchUnit
  separator?: string

  negative?: string
  positive?: string
  pointString?: string
  pointUnit?: MatchUnit
  separators?: MatchCharacter
  separateDigits?: number | number[]

  charset?: string | string[]
}

export interface ParseResult {
  prefix: string
  value: number
  unit: string
  metric: string
  remainder: string
  error?: string
}