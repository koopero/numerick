import { NumerickConfig, ParseResult } from "./types"
import { Config, pointUnitEnable } from "./config"
import { isArray, pow, charsetStandard, applyCharset, regexEscape } from "./math"
import { MatchCharacter, MatchUnit } from "./types"
import { ScaleParse } from "./metric"

import { isObject, isRegex, isString } from "./math"

function matchReplaceCharacters( str:string, match:MatchCharacter, replace = "" ) {
  if ( isArray(match) ) {
    for ( const m of match as Array<string> ) {
      str = matchReplaceCharacters( str, m, replace )
    }
    return str
  } else if ( match instanceof RegExp ) {
    return str.replace( match, replace )
  } else if ( typeof match === "string" ) {
    if ( match.length == 1 ) {
      return str.split(match).join(replace)
    }
    const chars = match.split("")
    for ( const m of chars ) {
      str = matchReplaceCharacters( str, m, replace )
    }
    return str
  }
  return str
}

function removeSeparators(str: string, separators: MatchCharacter) {
  str = matchReplaceCharacters( str, separators )

  return str
}


function unitConfigToRegex( unitConfig: MatchUnit ) {
  if ( unitConfig === undefined ) return ""
  if ( isArray(unitConfig) ) {
    return `${(unitConfig as Array<string>).map( regexEscape ).join("|")}`
  }
  if ( isString(unitConfig) ) {
    return regexEscape( unitConfig as string )
  }

  if ( isRegex(unitConfig) ) {
    return ( unitConfig as RegExp ).source
  }

  return ""
}


export function parseNumberRegex(config: NumerickConfig = {}) {
  const {
    radix = Config.radix,
    radixPrefix = Config.radixPrefix,
    pointString: point = Config.pointString,
    separators = Config.separators,
    scientific = true,
    scientificString = Config.scientificString,
    charset = charsetStandard,
    infinityString = Config.infinityString,
    padString = Config.padString,
    unit = Config.unit,
    metric = Config.metric,
    metricScale = ScaleParse,
    pointUnit = Config.pointUnit,
  } = config





  const startPadding = `[\\s${regexEscape(padString)}]*`
  const sign = "[\\-\\+]?"
  const digitOptions = []
  function pushDigitOptions( charset: MatchCharacter ) {
    if ( isArray(charset) ) {
      (charset as Array<string>).slice(0, radix).map( (c) => digitOptions.push(regexEscape(c)) )
    } else {
      (charset as string).substring(0, radix).split("").map( (c) => digitOptions.push(regexEscape(c)) )
    }
  }

  pushDigitOptions( charset )
  pushDigitOptions( separators )

  let pointReg = ""
  if ( pointUnit === true ) {
    pointReg = (pointUnitEnable as RegExp).source
  } else if ( isString(pointUnit) ) {
    pointReg = regexEscape(pointUnit as string)
  } else if ( isRegex(pointUnit) ) { 
    pointReg = (pointUnit as RegExp).source
  } else {
    pointReg = regexEscape(point)
  }

  const digit = `[${digitOptions.join("")}]`

  const scientificReg =
    scientific && digitOptions.indexOf(scientificString) == -1
      ? `(${regexEscape(scientificString)}[\\-\\+]?\\d+)?`
      : "()"


  const metricReg = `(?:${Object.keys(metricScale).join("|")})`
  const unitReg = unitConfigToRegex(unit)
  const source = `^(${digit}+)((${pointReg})(${digit}*)?)?${scientificReg}\\s*(${metricReg}${unitReg}|${unitReg})?`

  return new RegExp(source)
}


export function parseString(str: string, config: NumerickConfig = {}): ParseResult {
  const {
    radixPrefix = Config.radixPrefix,
    separators = Config.separators,
    negative = Config.negative,
    positive = Config.positive,
    metric = Config.metric,
    metricScale = ScaleParse,
    nanValue = Config.nanValue,
    scientificString = Config.scientificString,
    infinityString = Config.infinityString,
    charset,
    prefix:prefixConfig = Config.prefix,
  
    padString = Config.padString,
  } = config

  let { 
    radix = Config.radix,
  } = config


  let _metric = ""
  let unit = ""
  let remainder = ""
  let prefix = ""

  const paddingReg = new RegExp(`^[\\s*(${regexEscape(padString)})]+`)
  str = str.replace(paddingReg, "")

  // Replace prefix
  if ( isRegex( prefixConfig ) ) {
    const match = ( prefixConfig as RegExp ).exec(str)
    if ( match ) {
      prefix = match[0]
      str = str.substring(prefix.length)
    }
  } else if ( isArray( prefixConfig ) ) {
    for ( const item of prefixConfig as Array<string> ) {
      if ( str.startsWith(item) ) {
        prefix = item
        str = str.substring(item.length)
      }
    }
  } else if ( isString( prefixConfig ) ) {
    if ( str.startsWith(prefixConfig as string) ) {
      prefix = prefixConfig as string
      str = str.substring(prefix.length)
    }
  }

  str = str.replace(paddingReg, "")

  let sign = 1
  while ( 1 ) {
    if ( negative && str.startsWith(negative) ) {
      sign = -sign
      str = str.substring(negative.length)
      continue
    } else if ( positive && str.startsWith(positive) ) {
      sign = 1
      str = str.substring(positive.length)
      continue
    } 
    break
  }


  // Replace radixPrefix
  if (radixPrefix) {
    for (const item in radixPrefix) {
      if (item && str.startsWith(item)) {
        radix = radixPrefix[item]
        config = { ...config, radix }
        prefix += item
        str = str.substring(item.length)
        break
      }
    }
  }




  const regex = parseNumberRegex(config)

  let match = null
  let value = NaN

  if ( str.startsWith(infinityString) ) {
    str = str.substring(infinityString.length)
    value = Infinity
  } else {
    match = regex.exec(str)
  }

  if ( match ) {
    let [, parsedWhole = "", , parsedPoint = "", parsedFractional = ""  , parsedExponent = "", parsedUnit = ""] = match || []
    let mult = 1

    if ( parsedPoint && parsedPoint != "." ) {
      unit = parsedPoint
      parsedPoint = "."
    } else {
      unit = parsedUnit
    }

    let parsed = parsedWhole + parsedPoint + parsedFractional


    parsed = removeSeparators(parsed, separators)

    if (parsedExponent) {
      parsedExponent = parsedExponent.substring(scientificString.length)
      const factor = parseInt(parsedExponent)
      if (!isNaN(factor)) mult *= pow(10, factor)
    }

    if (metric && unit) {
      for (const prefix in metricScale) {
        if (prefix && unit.startsWith(prefix)) {
          mult *= metricScale[prefix]
          _metric = prefix
          unit = unit.substring(prefix.length)
          break
        }
      }
    }

    if (charset) parsed = applyCharset(parsed, charset, charsetStandard)
    value = parseFloatWithRadix(parsed, radix)
    value *= mult

    str = str.substring(match[0].length)
  }

  value *= sign

  if (isNaN(value)) value = nanValue


  return { prefix, value, unit, metric: _metric, remainder: str }
}



export function parseValue( value: any, config: NumerickConfig = {} ) : ParseResult {

  let result : ParseResult = {
    prefix: "",
    value: NaN,
    unit: "",
    metric: "",
    remainder: "",
    error: undefined
  }

  if ( typeof value === "number" ) {
    result.value = value
  } else if ( typeof value === "boolean" ) {
    result.value = value ? 1 : 0
  } else if ( typeof value === "string" ) {
    result = parseString( value, config )
  }

  return result
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


