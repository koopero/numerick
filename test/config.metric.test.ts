import { Metric, stringToNorm, stringToNumber, numberToString, parseValue, checkConfig } from "../src"
import { parseNumberRegex } from "../src/parse"
const { ScaleBinary, ScaleBinaryParse, ScaleBinaryShort, ScaleParse } = Metric

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

  test("Binary Metric", () => {
    // Read binary metric numbers with loose formatting
    expect(
      stringToNumber("64k", {
        metric: true,
        metricScale: ScaleBinaryParse,
      })
    ).toBe(65536)
    expect(
      stringToNumber("32Kib", {
        metric: true,
        metricScale: ScaleBinaryParse,
      })
    ).toBe(32768)

    // Format binary metric numbers with correct prefixes
    expect(
      numberToString(4096, { metric: true, metricScale: ScaleBinary })
    ).toBe("4Ki")

    // Format binary metric numbers with short, incorrect prefixes
    expect(
      numberToString(2 ** 21, {
        metric: true,
        metricScale: ScaleBinaryShort,
      })
    ).toBe("2m")
  })
  describe("alternate scales", () => {
    describe("ScaleBinary", () => {
      test("parseValue", () => {
        const config = { metric, metricScale: ScaleBinary, unit: "b" }
        expect(parseValue("1Kib", config)).toMatchObject({
          value: 1024,
          unit: "b",
        })
      })

      test("numberToString", () => { 
        const config = { metric, metricScale: ScaleBinary, unit: "b" }
        expect(numberToString(1024, config)).toBe("1Kib")
      })

    })

    test("metricScaleBinaryParse", () => {
      const config = { metric, metricScale: ScaleBinaryParse }
      expect(stringToNumber("2Kib", config)).toEqual(2048)
      expect(stringToNumber("2kb", config)).toEqual(2048)
      expect(stringToNumber("2K", config)).toEqual(2048)
    })

    test("metricScaleBinaryShort", () => {
      const config = { metric, metricScale: ScaleBinaryShort }
      expect(numberToString(1024, config)).toBe("1k")
      expect(numberToString(1024 ** 2, config)).toBe("1m")
      expect(numberToString(1024 ** 3, config)).toBe("1g")
    })
  })
})


describe("config.metric", () => {
  test("stringToNumber", () => {
    const config = { metric: true }
    expect(stringToNumber("1k", config)).toBe(1000)
    expect(stringToNumber("1M", config)).toBe(1000000)
    expect(stringToNumber("1m", config)).toBe(0.001)
  })

  test("numberToString", () => {
    const config = { metric: true }
    expect(numberToString(1100, config)).toBe("1.1k")
  })
})

describe("config.metricScale", () => {
  const metric = true
  describe("checkConfig", () => {
    const testForError = (config, errorType = "error") => {
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("metricScale")
      expect(error.type).toBe(errorType)
    }

    test("ScaleParse passes", () => {
      const errors = checkConfig({
        metricScale: ScaleParse,
      })
      expect(errors.length).toBe(0)
    })

    test("Bad scales", () => {
      // Out of order
      testForError({
        metric,
        metricScale: {
          a: 1,
          b: 1000,
        },
      })

      // No one
      testForError(
        {
          metric,
          metricScale: {
            a: 1000,
            b: 0.001,
          },
        },
        "warning"
      )

      // No one
      testForError({
        metric,
        metricScale: {
          a: NaN,
          b: "foo",
        },
      })
    })
  })
})

describe("config.metricFudge", () => {
  test("numberToString", () => {
    const metric = true
    expect(numberToString(1100000, { metric, metricFudge: 1e1 })).toBe("1100k")
    expect(numberToString(1100000, { metric, metricFudge: 1 })).toBe("1.1M")
    expect(numberToString(1100000, { metric, metricFudge: 1e-3 })).toBe(
      "0.0011G"
    )
  })

  test("with padding", () => {
    const metric = true
    expect(numberToString(1100000, { metric, length: 8, padZero: true })).toBe(
      "1.10000M"
    )
  })
})
