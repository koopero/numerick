export const EPSILON = 0.000001
export const {
  min,
  max,
  sqrt,
  sin,
  cos,
  asin,
  acos,
  PI,
  abs,
  floor,
  pow,
  round,
  log10,
  log,
  exp,
} = Math
export const minmax = (val: number, lo: number, hi: number) =>
  min(hi, max(val, lo))
export const saturate = (val: number) => (!val ? 0 : minmax(val, 0, 1))
export const isNumber = (val) => "number" == typeof val

export const distance = (a: number[], b: number[]) => {
  const len = min(a.length, b.length)
  let accum = 0
  for (let index = 0; index < len; index++) {
    const d = a[index] - b[index]
    accum += d * d || 0
  }
  return sqrt(accum)
}

export const fract = (num) => num - floor(num)
export const fractDeg = (num) => fract(num / 360) * 360
export const isRealNumber = (num) => "number" == typeof num && !isNaN(num)
export const sinDeg = (a) => sin((a / 180) * PI)
export const cosDeg = (a) => cos((a / 180) * PI)

export const isArray = (value) => Array.isArray(value)
export function isNegativeZero(value: number) {
  return value === 0 && 1 / value === -Infinity
}


export function applyCharset(
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


export function regexEscape(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function splitFractional(str: string) {
  const split = str.split(".")
  return [split[0], split[1] || ""]
}

export const charsetStandard = "0123456789abcdefghijklmnopqrstuvwxyz"

export function isString( value: any ) {
  return typeof value === "string"
}

export function isRegex( value: any ) {
  return value instanceof RegExp  
}

export function isObject( value: any ) {
  return typeof value === "object"
}