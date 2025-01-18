import { MatchUnit, NumerickConfig } from "./types"
import { Config } from "./config"
import { ScaleFormat } from "./metric"
import { isNegativeZero, log10, floor, pow, splitFractional, applyCharset, charsetStandard, isObject } from "./math"

function unitConfigToString(unitConfig: MatchUnit) {
  if (unitConfig === undefined) return ""
  if (Array.isArray(unitConfig)) {
    return (unitConfig as string[]).join("")
  }
  if (typeof unitConfig === "string") {
    return unitConfig
  }

  return ""
}

export function numberFormat(num: number, config: NumerickConfig = {}) {
  const {
    radix = Config.radix,
    radixPrefix = false,
    length = Config.length,
    precisionMax = Config.precisionMax,
    separator = Config.separator,
    separateDigits = Config.separateDigits,
    positive = Config.positive,
    negative = Config.negative,
    pointString = Config.pointString,
    padStart = Config.padStart,
    padZero = Config.padZero,
    precision = Config.precision,
    metric = Config.metric,
    metricFudge = Config.metricFudge,
    metricMin = Config.metricMin,
    metricMax = Config.metricMax,
    metricPad = Config.metricPad,
    metricScale = ScaleFormat,
    signZero = Config.signZero,
    nanString = Config.nanString,
    infinityString = Config.infinityString,
    scientific = Config.scientific,
    scientificString = Config.scientificString,
    scientificMin = Config.scientificMin,
    scientificMax = Config.scientificMax,
    padString = Config.padString,
    zeroString = Config.zeroString,
    pointUnit = Config.pointUnit,
    charset,
  } = config

  let { unit = Config.unit } = config
  unit = unitConfigToString(unit)

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


  if ( isObject(radixPrefix) ) {
    for (const prefix in radixPrefix as { [key: string]: number }) {
      if ( radixPrefix[prefix] === radix ) {
        resultPrefix = prefix
        break
      }
    }
  }

  let pointPicked = pointString

  if ( pointUnit && unit ) {
    pointPicked = unit
    unit = ""
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

  if (digitBudget > pointPicked.length) {
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
    resultFract = resultFract.substring(0, digitBudget - pointPicked.length)
    if (resultFract) resultPoint = pointPicked
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





