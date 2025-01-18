import { NumerickConfig } from "./types"
import { Config } from "./config"
import * as Metric from "./metric"


import { normToNumber, numberToNorm, numberToNumber } from "./normal"
import { stringToNumber, numberToString, normToString, stringToNorm } from "./convert"
import { checkConfig } from "./checkConfig"
import { parseValue } from "./parse"

export {
  Config,
  Metric,
  numberToNorm,
  stringToNumber,
  numberToString,
  numberToNumber,
  normToNumber,
  NumerickConfig,
  checkConfig,
  parseValue,
  normToString,
  stringToNorm,
}

