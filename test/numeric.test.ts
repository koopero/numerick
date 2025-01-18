import { describe, expect, test } from "@jest/globals"

import {
  numberToNorm,
  stringToNumber,
  numberToString,
  numberToNumber,
  normToNumber,
  checkConfig,
  parseValue,
  Metric,
} from "../src/index"

const { 
  ScaleParse,
} = Metric

import { testConversions } from "./testutil"
import { parseNumberRegex } from "../src/parse"

describe("config round-trip", () => {
  testConversions("min & max", { min: 0, max: 200 })
  testConversions("radix: 6", { radix: 6 })
  testConversions("metric", { max: 1e24, metric: true })

  // testConversions('min, expo', { min: -1, max: 2, expo: 1 } )
  testConversions("min, max, origin, expo", {
    min: -100,
    origin: 0,
    max: 1000,
    expo: 1,
  })
})

describe("Default config", () => {
  test("parseValue", () => {
    expect(parseValue("1e3")).toMatchObject({
      value: 1000,
      unit: "",
    })
  })
})


describe("numberToNorm", () => {
  test("passes number without options", () => {
    expect(numberToNorm(1)).toBe(1)
    expect(numberToNorm(42)).toBe(42)
    expect(numberToNorm(-100)).toBe(-100)
  })

  test("normalizes with ranges", () => {
    expect(numberToNorm(1, { max: 2 })).toBe(0.5)
  })
})

describe("numberToNumber", () => {
  test("passes number without options", () => {
    expect(numberToNumber(1)).toBe(1)
    expect(numberToNumber(42)).toBe(42)
    expect(numberToNumber(-100)).toBe(-100)
  })

  test("will apply step", () => {
    const config = { step: 1, bias: 0 }
    expect(numberToNumber(1, config)).toBe(1)
    expect(numberToNumber(1.5, config)).toBe(1)
    expect(numberToNumber(2.5, config)).toBe(2)
  })

  test("will clamp", () => {
    const config = { clamp: true }
    expect(numberToNumber(-1, config)).toBe(0)
    expect(numberToNumber(1, config)).toBe(1)
    expect(numberToNumber(2, config)).toBe(1)
  })
})

describe("stringToNumber", () => {
  test("works with no arguments", () => {
    expect(stringToNumber("0")).toBe(0)
    expect(stringToNumber("1")).toBe(1)
    expect(stringToNumber("1.5")).toBe(1.5)
  })

  test("will support metric", () => {
    const config = { metric: true }
    expect(stringToNumber("1k", config)).toBe(1000)
    expect(stringToNumber("1M", config)).toBe(1000000)
    expect(stringToNumber("1m", config)).toBe(0.001)
  })
})

describe("config.expo", () => {
  describe("normToNumber", () => {
    test("standard expo", () => {
      const config = {
        expo: 1,
      }

      expect(normToNumber(0, config)).toBe(0)
      expect(normToNumber(0.5, config)).toBe(0.25)
      expect(normToNumber(1, config)).toBe(1)
    })
  })
})


describe("separators", () => {
  test("will format not add unnecessary separators", () => {
    expect(numberToString(1e2, { separator: "_" })).toBe("100")
    expect(numberToString(-1e2, { separator: "_" })).toBe("-100")
  })

  test("will format in javascript style", () => {
    expect(numberToString(1e6, { separator: "_" })).toBe("1_000_000")
  })

  test("will parse numbers with common separators", () => {
    expect(stringToNumber("1_0_0_0")).toBe(1000)
    expect(stringToNumber("1'0'0'0")).toBe(1000)
  })

  test("will parse numbers with arbitrary separators", () => {
    expect(stringToNumber("1Z0Z0Z0", { separators: "Z" })).toBe(1000)
  })
})


describe("weird stuff you should probably not do", () => {
  test("combine radix and scientific", () => {
    const config = {
      scientific: true,
      radix: 2,
    }

    expect(numberToString(70, config)).toBe("111e+1")
    expect(stringToNumber("111e+1", config)).toBe(70)
  })
})
