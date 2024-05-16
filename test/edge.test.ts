import { describe, expect, test } from "@jest/globals"
import {
  numberToNorm,
  normToNumber,
  stringToNumber,
  stringToNumberUnit,
  numberToString,
  metricScaleBinaryShort,
  metricScaleBinary,
  metricScaleBinaryParse,
  checkConfig,
} from "../src/numerick"

describe("config.infinityString", () => {
  const infinityString = "reallyReallyBig"
  const negative = "-" + infinityString
  const config = { infinityString }
  test("stringToNumber", () => {
    expect(stringToNumber("Infinity")).toBe(Infinity)
    expect(stringToNumber(infinityString, config)).toBe(Infinity)
    expect(stringToNumber(negative, config)).toBe(-Infinity)
  })

  test("numberToString", () => {
    expect(numberToString(Infinity)).toBe("Infinity")
    expect(numberToString(-Infinity)).toBe("-Infinity")
    expect(numberToString(Infinity, config)).toBe(infinityString)
    expect(numberToString(-Infinity, config)).toBe(negative)
  })
})

describe("config.metric", () => {
  const metric = true

  test("+metricFudge +metricMin", () => {
    const config = { metric, metricFudge: 10, metricMin: 1 }
    expect(numberToString(999, config)).toBe("999")
    expect(numberToString(1000, config)).toBe("1000")
    expect(numberToString(9000, config)).toBe("9000")
    expect(numberToString(100000, config)).toBe("100k")
    expect(numberToString(999000, config)).toBe("999k")
    expect(numberToString(1000000, config)).toBe("1000k")
  })
  test("+metricMax", () => {
    const config = { metric, metricMax: 1e6 }
    expect(numberToString(1, config)).toBe("1")
    expect(numberToString(1e6, config)).toBe("1M")
    expect(numberToString(1e9, config)).toBe("1000M")
  })

  test("+metricPad", () => {
    const config = { metric, metricPad: 2, unit: "u" }
    expect(numberToString(1, config)).toBe("1  u")
    expect(numberToString(2e3, config)).toBe("2 ku")
    expect(numberToString(3e6, config)).toBe("3 Mu")
  })

  test("+precision", () => {
    const config = { metric, precision: 0 }
    expect(numberToString(2004, config)).toBe("2k")
  })

  describe("alternate scales", () => {
    test("metricScaleBinary", () => {
      const config = { metric, metricScale: metricScaleBinary, unit: "b" }
      expect(numberToString(1024, config)).toBe("1Kib")
      expect(stringToNumberUnit("2Kib", config)).toEqual({
        value: 2048,
        unit: "b",
      })
      expect(stringToNumberUnit("2Gip", config)).toEqual({
        value: 2 ** 31,
        unit: "p",
      })
    })

    test("metricScaleBinaryParse", () => {
      const config = { metric, metricScale: metricScaleBinaryParse }
      expect(stringToNumber("2Kib", config)).toEqual(2048)
      expect(stringToNumber("2kb", config)).toEqual(2048)
      expect(stringToNumber("2K", config)).toEqual(2048)
    })

    test("metricScaleBinaryShort", () => {
      const config = { metric, metricScale: metricScaleBinaryShort }
      expect(numberToString(1024, config)).toBe("1k")
      expect(numberToString(1024 ** 2, config)).toBe("1m")
      expect(numberToString(1024 ** 3, config)).toBe("1g")
    })
  })
})

describe("config.precision", () => {
  test("default to 4 digits", () => {
    const config = { precision: 1 }
    expect(numberToString(1.23456789, config)).toBe("1.2345")
  })

  test("zero for no digits", () => {
    const config = { precision: 0 }
    expect(numberToString(1.234, config)).toBe("1")
  })

  test("exact number of digits", () => {
    const config = { precision: 2 }
    expect(numberToString(1.234, config)).toBe("1.2")
  })
})

describe("config.scientific", () => {
  test("it will parse by default", () => {
    expect(stringToNumber("1e3")).toBe(1000)
  })

  test("it will turn off", () => {
    expect(stringToNumberUnit("1e3", { scientific: false })).toEqual({
      value: 1,
      unit: "e3",
    })
  })
})

describe("config.precisionMax", () => {
  test("show many digits", () => {
    const config = { precisionMax: 6 }
    expect(numberToString(1.23456789, config)).toBe("1.23456")
  })
})

describe("config.padString", () => {
  const config = {
    padStart: true,
    padString: "_",
    precision: 2,
    length: 8,
  }
  test("numberToString", () => {
    expect(numberToString(123.45, config)).toBe("___123.4")
  })
  test("stringToNumber", () => {
    expect(stringToNumber("___123.45", config)).toBe(123.45)
  })
})

describe("config.zeroString", () => {
  const config = {
    padZero: true,
    zeroString: "o",
    length: 6,
  }
  test("numberToString", () => {
    expect(numberToString(12.3, config)).toBe("12.3oo")
    expect(numberToString(12.34, config)).toBe("12.34o")
    expect(numberToString(123.4, config)).toBe("123.4o")
  })
})

describe("config.charset", () => {
  describe("wacky charsets", () => {
    test("abcd", () => {
      const config = {
        radix: 4,
        charset: ["a", "b", "c", "d"],
      }
      const string = "dcba.abcd"
      const number = 3 * 64 + 2 * 16 + 1 * 4 + 1 / 16 + 2 / 64 + 3 / 256
      expect(numberToString(number, config)).toBe(string)
      expect(stringToNumber(string, config)).toBe(number)
    })
  })

  describe("checkConfig", () => {
    test("Error if charset is too short", () => {
      const config = { charset: "abc" }
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("charset")
      expect(error.type).toBe("error")
    })
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

describe("config.unit", () => {
  describe("stringToNumberUnit", () => {
    test("Captures unicode unit", () => {
      const unit = "°"
      const config = { unit }
      const number = 270
      const string = numberToString(number, config)
      const result = stringToNumberUnit(string)
      expect(result.unit).toBe(unit)
      expect(result.value).toBe(number)
    })
  })
})

describe("config.logarithmic", () => {
  describe("basic", () => {
    const config = {
      logarithmic: true,
      min: 1,
      max: 4,
    }

    test("normToNumber", () => {
      expect(normToNumber(0, config)).toBeCloseTo(1)
      expect(normToNumber(0.5, config)).toBeCloseTo(2)
      expect(normToNumber(1, config)).toBeCloseTo(4)
    })

    test("numberToNorm", () => {
      expect(numberToNorm(1, config)).toBeCloseTo(0)
      expect(numberToNorm(2, config)).toBeCloseTo(0.5)
      expect(numberToNorm(4, config)).toBeCloseTo(1)
    })
  })

  describe("shifted origin", () => {
    const config = {
      logarithmic: true,
      origin: -1,
      min: 0,
      max: 3,
    }

    test("normToNumber", () => {
      expect(normToNumber(0, config)).toBeCloseTo(0)
      expect(normToNumber(0.5, config)).toBeCloseTo(1)
      expect(normToNumber(1, config)).toBeCloseTo(3)
    })

    test("numberToNorm", () => {
      expect(numberToNorm(0, config)).toBeCloseTo(0)
      expect(numberToNorm(1, config)).toBeCloseTo(0.5)
      expect(numberToNorm(3, config)).toBeCloseTo(1)
    })
  })

  describe("error on min == 0", () => {
    test("checkConfig", () => {
      const config = { logarithmic: true }
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("logarithmic")
      expect(error.type).toBe("error")
    })
  })
})
