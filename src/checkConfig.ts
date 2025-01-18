import { NumerickConfig } from "./types"
import { Config } from "./config"
import { isRealNumber, charsetStandard, isArray } from "./math"


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
    min = Config.min,
    max = Config.max,
    bias = Config.bias,
    origin = Config.origin,
    radix = Config.radix,
    metric = Config.metric,
    metricScale = Config.metricScale,
    scientific,
    scientificString = Config.scientificString,
    logarithmic = Config.logarithmic,
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
