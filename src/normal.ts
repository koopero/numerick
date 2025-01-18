import { NumerickConfig } from "./types"
import { Config } from "./config"
import { floor, max, pow, saturate, exp, log, minmax } from "./math"

export function quantizeNumber(value: number, config: NumerickConfig = {}) {
  const {
    origin = Config.origin,
    quant = Config.quant,
    step = Config.step,
    bias = Config.bias,
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
    expo = Config.expo,
    origin = Config.origin,
    min = Config.min,
    max = Config.max,
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
    origin = Config.origin,
    deadzone = Config.deadzone,
    min = Config.min,
    max = Config.max,
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



export function numberToNumber(value: number, config: NumerickConfig = {}) {
  const {
    min = Config.min,
    max = Config.max,
    clamp = Config.clamp,
    nanValue = Config.nanValue,
  } = config

  value = quantizeNumber(value, config)

  if (clamp) {
    value = minmax(value, min, max)
  }

  if (isNaN(value)) value = nanValue

  return value
}



export function normToNumber(value: number, config: NumerickConfig) {
  const {
    min = Config.min,
    max = Config.max,
    origin = Config.origin,
    logarithmic = Config.logarithmic,
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
    min = Config.min,
    max = Config.max,
    origin = Config.origin,
    logarithmic = Config.logarithmic,
    clamp = Config.clamp,
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
