import { NumerickConfig } from "./types"

export const radixPrefixEnable = {
  "0x": 16,
  "0b": 2,
  "0o": 8,
  "0X": 16,
  "0B": 2,
  "0O": 8,
}

export const pointUnitEnable = /[a-zA-Z\.]/

export const Config: NumerickConfig = {
  radix: 10,
  radixPrefix: radixPrefixEnable,
  min: 0,
  max: 1,
  origin: 0,
  expo: 0,
  digits: 4,
  step: 0,
  logarithmic: false,
  quant: 1/4000,
  deadzone: 0,
  length: 0,
  negative: "-",
  positive: "",
  metric: false,
  metricFudge: 1,
  metricMin: 0,
  metricMax: 0,
  prefix: "",
  unit: /[\w°]+[^\s\-*+]*/,
  pointString: ".",
  pointUnit: false,
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

const percentDefaults = {
  max: 100,
  unit: "%",
}


export function argToConfig(arg: any, defaults?:object ) {
  if ( "object" !== typeof arg && !defaults ) return arg
  defaults = defaults || {}
  if ( "object" !== typeof arg ) return { ...defaults, ...arg}
  if ( arg === true ) return {}
  if ( arg === "%" ) return { ...defaults, ...percentDefaults }
  if (typeof arg == "number") return { ...defaults, precision: arg }
  if (typeof arg == "string") return { ...defaults, unit: arg }
  return arg || defaults
}