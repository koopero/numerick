import {
  floor,
  isRealNumber,
  log10,
  max,
  minmax,
  pow,
  saturate,
  exp,
  log,
} from "./math"
export const isArray = (value) => Array.isArray(value)

const charsetStandard = "0123456789abcdefghijklmnopqrstuvwxyz"

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
  prefix?: string
  radix?: number
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

  unit?: string
  separator?: string

  negative?: string
  positive?: string
  pointString?: string
  separators?: string | string[]
  separateDigits?: number | number[]

  charset?: string | string[]
}

const configDefault: NumerickConfig = {
  radix: 10,
  min: 0,
  max: 1,
  origin: 0,
  expo: 0,
  digits: 4,
  step: 0,
  logarithmic: false,
  quant: 0.0000125,
  deadzone: 0,
  length: 0,
  negative: "-",
  positive: "",
  metric: false,
  metricFudge: 1,
  metricMin: 0,
  metricMax: 0,
  prefix: "",
  unit: "",
  pointString: ".",
  separator: "",
  separators: ",'_",
  separateDigits: 3,
  nanString: "NaN",
  infinityString: "Infinity",
  nanValue: NaN,
  padStart: false,
  padZero: false,
  padString: " ",
  zeroString: "0",
  scientificString: "e",
  scientificMin: 1e-3,
  scientificMax: 0,
  precision: 1,
  precisionMax: 5,
  bias: 0.5,
}

export const metricScaleParse = {
  Y: 1e24,
  Z: 1e21,
  E: 1e18,
  P: 1e15,
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  h: 1e2,
  da: 1e1,
  "": 1,
  d: 1e-1,
  c: 1e-2,
  m: 1e-3,
  u: 1e-6,
  μ: 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
  a: 1e-18,
  z: 1e-21,
  y: 1e-24,
}

export const metricScaleFormat = {
  Y: 1e24,
  Z: 1e21,
  E: 1e18,
  P: 1e15,
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  "": 1,
  m: 1e-3,
  μ: 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
  a: 1e-18,
  z: 1e-21,
  y: 1e-24,
}

export const metricScaleAscii = {
  Y: 1e24,
  Z: 1e21,
  E: 1e18,
  P: 1e15,
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  "": 1,
  m: 1e-3,
  u: 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
  a: 1e-18,
  z: 1e-21,
  y: 1e-24,
}

const pow1024 = (a: number) => pow(1024, a)

export const metricScaleBinary = {
  Yi: pow1024(8),
  Zi: pow1024(7),
  Ei: pow1024(6),
  Pi: pow1024(5),
  Ti: pow1024(4),
  Gi: pow1024(3),
  Mi: pow1024(2),
  Ki: pow1024(1),
}

export const metricScaleBinaryParse = {
  Yi: pow1024(8),
  Y: pow1024(8),
  yi: pow1024(8),
  y: pow1024(8),
  Zi: pow1024(7),
  Z: pow1024(7),
  zi: pow1024(7),
  z: pow1024(7),
  Ei: pow1024(6),
  E: pow1024(6),
  ei: pow1024(6),
  e: pow1024(6),
  Pi: pow1024(5),
  P: pow1024(5),
  pi: pow1024(5),
  p: pow1024(5),
  Ti: pow1024(4),
  T: pow1024(4),
  ti: pow1024(4),
  t: pow1024(4),
  Gi: pow1024(3),
  G: pow1024(3),
  gi: pow1024(3),
  g: pow1024(3),
  Mi: pow1024(2),
  M: pow1024(2),
  mi: pow1024(2),
  m: pow1024(2),
  Ki: pow1024(1),
  K: pow1024(1),
  ki: pow1024(1),
  k: pow1024(1),
}

export const metricScaleBinaryShort = {
  y: pow1024(8),
  z: pow1024(7),
  e: pow1024(6),
  p: pow1024(5),
  t: pow1024(4),
  g: pow1024(3),
  m: pow1024(2),
  k: pow1024(1),
}

function isNegativeZero(value: number) {
  return value === 0 && 1 / value === -Infinity
}

export function quantizeNumber(value: number, config: NumerickConfig = {}) {
  const {
    origin = configDefault.origin,
    quant = configDefault.quant,
    step = configDefault.step,
    bias = configDefault.bias,
  } = config

  const useQuant = max(quant || 0, step || 0)
  if (useQuant) {
    value -= origin
    value /= useQuant
    let whole = floor(value)
    const fract = value - whole

    if (fract > 0 && fract >= 1 - saturate(bias)) whole += 1

    value = whole * useQuant
    value += origin
  }

  return value
}

export function numberApplyExpo(
  value: number,
  config: NumerickConfig = {},
  effect = 1
) {
  const {
    expo = configDefault.expo,
    origin = configDefault.origin,
    min = configDefault.min,
    max = configDefault.max,
  } = config

  if (expo) {
    const exp = pow(2, expo * effect)

    value -= origin

    const sign = value < 0 ? -1 : 1
    const maxDist = max - origin
    const minDist = origin - min
    const range = value >= 0 ? maxDist || minDist : minDist || maxDist

    if (range) {
      value *= sign
      value /= range
      value = Math.max(0, value)
      value = pow(value, exp)
      value *= range
      value *= sign
    }

    value += origin
  }

  return value
}

export function numberDeadzone(
  value: number,
  config: NumerickConfig = {},
  effect = 1
) {
  const {
    origin = configDefault.origin,
    deadzone = configDefault.deadzone,
    min = configDefault.min,
    max = configDefault.max,
  } = config

  if (deadzone) {
    value -= origin

    if (value) {
      const sign = value < 0 ? -1 : 1
      const maxDist = max - origin
      const minDist = origin - min
      const range = value >= 0 ? maxDist : minDist
      value *= sign
      value =
        Math.max(0, value - deadzone * effect) *
        pow(range - deadzone * effect, -effect) *
        pow(range, effect)
      value *= sign
    }

    value += origin
  }

  return value
}

export function normToNumber(value: number, config: NumerickConfig) {
  const {
    min = configDefault.min,
    max = configDefault.max,
    origin = configDefault.origin,
    logarithmic = configDefault.logarithmic,
  } = config

  value = logarithmic
    ? exp(log(min - origin) + (log(max - origin) - log(min - origin)) * value) +
      origin
    : min + (max - min) * value
  value = numberDeadzone(value, config, 1)
  value = numberApplyExpo(value, config, 1)
  value = numberToNumber(value, config)

  return value
}

export function numberToNorm(value: number, config: NumerickConfig = {}) {
  const {
    min = configDefault.min,
    max = configDefault.max,
    origin = configDefault.origin,
    logarithmic = configDefault.logarithmic,
    clamp = configDefault.clamp,
  } = config

  value = quantizeNumber(value, config)
  value = numberApplyExpo(value, config, -1)
  value = numberDeadzone(value, config, -1)

  value = logarithmic
    ? (log(value - origin) - log(min - origin)) /
      (log(max - origin) - log(min - origin))
    : (value - min) / (max - min)

  if (clamp) {
    value = saturate(value)
  }

  return value
}

export function numberToNumber(value: number, config: NumerickConfig = {}) {
  const {
    min = configDefault.min,
    max = configDefault.max,
    clamp = configDefault.clamp,
    nanValue = configDefault.nanValue,
  } = config

  value = quantizeNumber(value, config)

  if (clamp) {
    value = minmax(value, min, max)
  }

  if (isNaN(value)) value = nanValue

  return value
}

export function numberFormat(num: number, config: NumerickConfig = {}) {
  const {
    radix = configDefault.radix,
    length = configDefault.length,
    precisionMax = configDefault.precisionMax,
    separator = configDefault.separator,
    separateDigits = configDefault.separateDigits,
    positive = configDefault.positive,
    negative = configDefault.negative,
    pointString = configDefault.pointString,
    unit = configDefault.unit,
    padStart = configDefault.padStart,
    padZero = configDefault.padZero,
    precision = configDefault.precision,
    metric = configDefault.metric,
    metricFudge = configDefault.metricFudge,
    metricMin = configDefault.metricMin,
    metricMax = configDefault.metricMax,
    metricPad = configDefault.metricPad,
    metricScale = metricScaleFormat,
    signZero = configDefault.signZero,
    nanString = configDefault.nanString,
    infinityString = configDefault.infinityString,
    scientific = configDefault.scientific,
    scientificString = configDefault.scientificString,
    scientificMin = configDefault.scientificMin,
    scientificMax = configDefault.scientificMax,
    padString = configDefault.padString,
    zeroString = configDefault.zeroString,
    charset,
  } = config

  let resultPrefix = ""
  let resultSign = ""
  let resultNaN = ""
  let resultWhole = ""
  let resultPoint = ""
  let resultFract = ""
  let resultMultiplier = ""
  let resultExponent = ""

  const sign = num < 0 || (signZero && isNegativeZero(num)) ? -1 : 1
  resultSign =
    sign < 0 || (signZero && isNegativeZero(num * sign)) ? negative : positive

  if (isNaN(num)) {
    resultNaN = nanString
  } else if (!isFinite(num)) {
    resultNaN = infinityString
  } else {
    num *= sign
    if (scientific) {
      if (num) {
        let exponentNum = num
        exponentNum = Math.max(scientificMin, exponentNum)
        if (scientificMax) exponentNum = Math.min(scientificMax, exponentNum)

        const exponent = floor(log10(exponentNum))
        num /= pow(10, exponent)
        resultMultiplier = scientificString
        resultExponent = exponent >= 0 ? "+" + exponent : String(exponent)
      } else {
        resultMultiplier = scientificString
        resultExponent = "+0"
      }
    } else if (metric) {
      let metricStr = ""
      for (const prefix in metricScale) {
        const metricMult = metricScale[prefix]
        if (
          (metricMult <= metricMax || !metricMax) &&
          metricMult >= metricMin &&
          num >= metricMult * metricFudge
        ) {
          num /= metricMult
          metricStr = prefix
          break
        }
      }

      if (metricPad && padString)
        while (metricStr.length < metricPad) metricStr = padString + metricStr

      resultMultiplier = metricStr
    }

    const numberStr = num.toString(radix)
    const split = splitFractional(numberStr)
    resultWhole = split[0]
    resultFract = split[1] || ""
  }

  if (separator) {
    resultWhole = formatNumberWithDigitGroups(
      resultWhole,
      separator,
      separateDigits
    )
  }

  if (charset) {
    resultWhole = applyCharset(resultWhole, charsetStandard, charset)
    resultFract = applyCharset(resultFract, charsetStandard, charset)
  }

  let lengthSoFar =
    0 +
    resultPrefix.length +
    resultSign.length +
    resultNaN.length +
    resultWhole.length +
    resultPoint.length +
    resultMultiplier.length +
    resultExponent.length +
    unit.length

  const digitBudget =
    precision == 0
      ? 0
      : precision == 1
      ? length
        ? length - lengthSoFar
        : precisionMax
      : precision

  if (digitBudget > pointString.length) {
    if (padZero && !padStart) {
      while (resultFract.length < digitBudget) {
        resultFract += zeroString
      }
    }

    if (precision > 1) {
      while (resultFract.length < precision - 1) {
        resultFract += zeroString
      }
    }
    resultFract = resultFract.substring(0, digitBudget - pointString.length)
    if (resultFract) resultPoint = pointString
  } else {
    resultFract = ""
  }

  lengthSoFar += resultPoint.length + resultFract.length

  if (padStart && padZero && zeroString && length) {
    while (lengthSoFar < length) {
      resultWhole = zeroString + resultWhole
      lengthSoFar += zeroString.length
    }
  } else if (padStart && padString && length) {
    while (lengthSoFar < length) {
      resultPrefix = padString + resultPrefix
      lengthSoFar += padString.length
    }
  }

  return [
    resultPrefix,
    resultSign,
    resultNaN,
    resultWhole,
    resultPoint,
    resultFract,
    resultMultiplier,
    resultExponent,
    unit,
  ]
}

export function numberToString(value: number, config: NumerickConfig = {}) {
  return numberFormat(value, config).join("")
}

function parseNumberRegex(config: NumerickConfig = {}) {
  const {
    radix = configDefault.radix,
    pointString: point = configDefault.pointString,
    scientific = true,
    scientificString = configDefault.scientificString,
    charset = charsetStandard,
    infinityString = configDefault.infinityString,
    padString = configDefault.padString,
  } = config

  const startPadding = `[\\s${regexEscape(padString)}]*`
  const sign = "[\\-\\+]?"
  const digit = isArray(charset)
    ? `(${(charset as Array<string>)
        .slice(0, radix)
        .map(regexEscape)
        .join("|")})`
    : `[${(charset as string).substring(0, radix)}]`

  const scientificReg =
    scientific && digit.indexOf(scientificString) == -1
      ? `(${regexEscape(scientificString)}[\\-\\+]?\\d+)?`
      : "()"
  const source = `^${startPadding}(${sign}(${digit}+(${regexEscape(
    point
  )}${digit}*)?|${regexEscape(infinityString)}))${scientificReg}\\s*(.+)?`

  return new RegExp(source)
}

function applyCharset(
  str: string,
  charset: string | string[],
  to: string | string[]
) {
  const reg = isArray(charset)
    ? `(${(charset as Array<string>).map(regexEscape).join("|")})`
    : `[${charset as string}]`

  const ex = new RegExp(reg, "g")
  str = str.replace(ex, (match) => to[charset.indexOf(match)] || "")
  return str
}

export function stringToNumberUnit(str: string, config: NumerickConfig = {}) {
  const {
    radix = configDefault.radix,
    separators = configDefault.separators,
    negative = configDefault.negative,
    positive = configDefault.positive,
    metric = configDefault.metric,
    metricScale = metricScaleParse,
    nanValue = configDefault.nanValue,
    scientificString = configDefault.scientificString,
    infinityString = configDefault.infinityString,
    charset,
  } = config

  // Replace negative
  if (negative != "-" && str.startsWith(negative))
    str = "-" + str.substring(negative.length)

  // Replace positive
  if (positive && positive != "+" && str.startsWith(positive))
    str = str.substring(positive.length)

  str = removeSeparators(str, separators)

  const regex = parseNumberRegex(config)

  const match = regex.exec(str)
  let [, parsed = "", , , parsedExponent = "", parsedUnit = ""] = match || []
  let mult = 1

  if (parsedExponent) {
    parsedExponent = parsedExponent.substring(scientificString.length)
    const factor = parseInt(parsedExponent)
    if (!isNaN(factor)) mult *= pow(10, factor)
  }

  if (metric && parsedUnit) {
    for (const prefix in metricScale) {
      if (prefix && parsedUnit.startsWith(prefix)) {
        mult *= metricScale[prefix]
        parsedUnit = parsedUnit.substring(prefix.length)
        break
      }
    }
  }

  if (charset) parsed = applyCharset(parsed, charset, charsetStandard)

  let value: number = parsed.startsWith(infinityString)
    ? Infinity
    : parsed.startsWith(negative + infinityString)
    ? -Infinity
    : parseFloatWithRadix(parsed, radix)

  value *= mult

  if (isNaN(value)) value = nanValue

  return { value, unit: parsedUnit }
}

export function stringToNumber(
  str: string,
  config: NumerickConfig = {}
): number {
  const { value } = stringToNumberUnit(str, config)
  return value
}

export function stringToNorm(str: string, config: NumerickConfig = {}) {
  const value = stringToNumber(str, config)
  return numberToNorm(value, config)
}

export function normToString(value: number, config: NumerickConfig = {}) {
  value = normToNumber(value, config)
  return numberToString(value, config)
}

function parseFloatWithRadix(string: string, radix: number) {
  if (radix == 10) return parseFloat(string)

  // Bugs down below.
  const [integerPart, fractionalPart] = string.split(".")

  if (!radix || radix < 2 || radix > 36) return NaN

  let result = parseInt(integerPart, radix)
  let digits = 0
  if (fractionalPart) {
    for (; digits < fractionalPart.length; digits++) {
      const digit = parseInt(fractionalPart[digits], radix)
      result += (digit / Math.pow(radix, digits + 1)) * 1
    }
  }

  return result
}

function splitFractional(str: string) {
  const split = str.split(".", 2)
  split[1] = split[1] || ""
  return split
}

function removeSeparators(numberString: string, separators: string | string[]) {
  if (!Array.isArray(separators)) separators = separators.split("")

  const regexSource = `(?<!^)[${separators.map(regexEscape).join("")}]`
  const regex = new RegExp(regexSource, "g")

  return numberString.replace(regex, "")
}

function formatNumberWithDigitGroups(
  numberString: string,
  separator: string,
  separateDigits: number | number[]
) {
  if (!Array.isArray(separateDigits)) separateDigits = [separateDigits]

  let formattedNumber = ""
  let groupIndex = 0
  let groupDigits = separateDigits[groupIndex]

  for (let i = numberString.length - 1; i >= 0; i--) {
    const digit = numberString[i]
    formattedNumber = digit + formattedNumber

    if (!--groupDigits && i > 0) {
      formattedNumber = separator + formattedNumber

      if (groupIndex < separateDigits.length - 1) groupIndex++

      groupDigits = separateDigits[groupIndex]
    }
  }

  return formattedNumber
}

export function checkConfig(config: NumerickConfig) {
  const result = []

  function addError(key, message) {
    const type = "error"
    result.push({ key, type, message })
  }

  function addWarning(key, message) {
    const type = "warning"
    result.push({ key, type, message })
  }

  const {
    min = configDefault.min,
    max = configDefault.max,
    bias = configDefault.bias,
    origin = configDefault.origin,
    radix = configDefault.radix,
    metric = configDefault.metric,
    metricScale = configDefault.metricScale,
    scientific,
    scientificString = configDefault.scientificString,
    logarithmic = configDefault.logarithmic,
  } = config

  let { charset } = config

  if (!isRealNumber(min)) addError("min", "Invalid value")
  if (!isRealNumber(max)) addError("max", "Invalid value")
  if (min == max) addError("max", "min value is equal to max")

  if (!isRealNumber(bias)) addError("bias", "Invalid value")
  if (bias < 0 || bias > 1) addWarning("bias", "Out of range")

  if (!isRealNumber(radix)) addError("radix", "Invalid value")
  if (radix < 2 || radix > 36) addError("radix", "Outside valid range")

  if (origin < Math.min(min, max) || origin > Math.max(min, max))
    addWarning("origin", "Outside min-max range")

  if (charset) {
    if (charset.length < radix) addError("charset", "Length is less than radix")

    for (let index = 0; index < charset.length; index++) {
      if (charset.indexOf(charset[index], index + 1) != -1) {
        addError("charset", "Duplicate entries")
        break
      }
    }
  } else {
    charset = charsetStandard
  }

  if (!isArray(charset)) charset = (charset as string).split("")

  charset = charset.slice(0, radix)

  if (scientific && charset.indexOf(scientificString))
    addError("scientificString", "is included in charset")

  if (metric) {
    let lowest = Infinity
    let hasOne = false

    for (const key in metricScale) {
      const value = metricScale[key]

      if (!isRealNumber(value)) {
        addError("metricScale", `Non-numeric value for key ${key}`)
        break
      }

      if (value == 1) hasOne = true

      if (value > lowest) {
        addError("metricScale", "Values are not correctly ordered")
        break
      }
      lowest = value
    }

    if (lowest < 1 && !hasOne)
      addWarning("metricScale", "No value for 1 provided")
  }

  if (logarithmic) {
    if (min - origin <= 0) {
      addError("logarithmic", "Invalid min")
    }

    if (max - origin <= 0) {
      addError("logarithmic", "Invalid max")
    }
  }

  return result
}

function regexEscape(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
