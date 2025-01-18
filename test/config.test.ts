import { numberToString, numberToNorm, numberToNumber, stringToNumber } from "../src"
import type { NumerickConfig } from "../src"

describe("config.signZero", () => {
  test("numberToString", () => {
    const config = {
      signZero: true,
      positive: "+",
    }
    expect(numberToString(-0, config)).toBe("-0")
    expect(numberToString(0, config)).toBe("+0")
  })
})

describe("config.clamp", () => {
  test("numberToNorm", () => {
    const config = { min: -2, max: 2, clamp: true }
    expect(numberToNorm(-3, config)).toBe(0)
    expect(numberToNorm(-2, config)).toBe(0)
    expect(numberToNorm(-1, config)).toBe(0.25)
    expect(numberToNorm(0, config)).toBe(0.5)
    expect(numberToNorm(1, config)).toBe(0.75)
    expect(numberToNorm(2, config)).toBe(1)
    expect(numberToNorm(3, config)).toBe(1)
  })
})

describe("config.bias", () => {
  describe("numberToNumber", () => {
    test("rounds up and down", () => {
      const step = 3
      expect(numberToNumber(0, { step, bias: 0 })).toBe(0)
      expect(numberToNumber(1, { step, bias: 0 })).toBe(0)
      expect(numberToNumber(2, { step, bias: 0 })).toBe(0)
      expect(numberToNumber(3, { step, bias: 0 })).toBe(3)

      expect(numberToNumber(0, { step, bias: 0.5 })).toBe(0)
      expect(numberToNumber(1, { step, bias: 0.5 })).toBe(0)
      expect(numberToNumber(2, { step, bias: 0.5 })).toBe(3)
      expect(numberToNumber(3, { step, bias: 0.5 })).toBe(3)

      expect(numberToNumber(0, { step, bias: 1 })).toBe(0)
      expect(numberToNumber(1, { step, bias: 1 })).toBe(3)
      expect(numberToNumber(2, { step, bias: 1 })).toBe(3)
      expect(numberToNumber(3, { step, bias: 1 })).toBe(3)
    })
  })
})


describe("config.nanValue", () => {
  test("stringToNumber", () => {
    // Don't do this!
    const nanValue = 666
    const config = { nanValue }
    expect(stringToNumber("NaN", config)).toBe(nanValue)
  })

  test("numberToNumber", () => {
    const nanValue = 666
    const config = { nanValue }
    expect(numberToNumber(NaN, config)).toBe(nanValue)
  })
})


describe("config.nanString", () => {
  test("works", () => {
    const nanString = "notANumber"
    const config = { nanString }
    expect(numberToString(NaN, config)).toBe(nanString)
  })
})

describe("config.length", () => {
  describe("numberToString", () => {
    test("with padStart", () => {
      const config = {
        length: 4,
        padStart: true,
      }
      expect(numberToString(1, config)).toBe("   1")
      expect(numberToString(-1, config)).toBe("  -1")
    })

    test("with padStart + padZero", () => {
      const config = {
        length: 4,
        padStart: true,
        padZero: true,
      }
      expect(numberToString(1, config)).toBe("0001")
      expect(numberToString(-1, config)).toBe("-001")
    })

    test("with padZero", () => {
      const config = {
        length: 4,
        padZero: true,
      }
      expect(numberToString(1, config)).toBe("1.00")
      expect(numberToString(-1, config)).toBe("-1.0")
    })

    test("with padZero + positive", () => {
      const config = {
        length: 5,
        padZero: true,
        positive: "+",
      }
      expect(numberToString(1.1, config)).toBe("+1.10")
      expect(numberToString(-1.1, config)).toBe("-1.10")
    })

    test("with padStart + positive + precision + unit", () => {
      const config = {
        length: 9,
        padStart: true,
        positive: "+",
        precision: 4,
        unit: "q",
      }
      expect(numberToString(1.1, config)).toBe("  +1.100q")
      expect(numberToString(-1.1, config)).toBe("  -1.100q")
    })

    test("is overridden by precision", () => {
      const config = {
        length: 4,
        precision: 6,
      }
      expect(numberToString(1.1, config)).toBe("1.10000")
    })
  })
})


describe("config.negative", () => {
  test("will handle weird parameters", () => {
    const config: NumerickConfig = {
      negative: "n",
    }

    expect(numberToString(-1, config)).toBe("n1")
    expect(stringToNumber("n1", config)).toBe(-1)
  })
})

describe("config.positive", () => {
  test("will handle weird parameters", () => {
    const config: NumerickConfig = {
      positive: "p",
    }

    expect(numberToString(1, config)).toBe("p1")
    expect(stringToNumber("p1", config)).toBe(1)
  })
})

describe("config.separateDigits", () => {
  test("will format in Indian style", () => {
    expect(
      numberToString(1e6, { separator: ",", separateDigits: [3, 2] })
    ).toBe("10,00,000")
    expect(
      numberToString(1e5, { separator: ",", separateDigits: [3, 2] })
    ).toBe("1,00,000")
    expect(
      numberToString(1e4, { separator: ",", separateDigits: [3, 2] })
    ).toBe("10,000")
  })
})
