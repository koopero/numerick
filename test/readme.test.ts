import { stringToNumber, numberToString, normToNumber, numberToNorm } from "../src"
import { ScaleAscii } from "../src/metric"

describe("examples from readme", () => {
  test("Parsing", () => {
    expect(stringToNumber("1.234k", { metric: true })).toBe(1234)
    expect(stringToNumber("1110.01", { radix: 2 })).toBe(14.25)
  })
  test("Formatting", () => {
    expect(
      numberToString(1234, {
        separator: ",",
        padStart: true,
        length: 8,
        unit: "u",
      })
    ).toBe("  1,234u")
  })

  test("Normalized Numbers", () => {
    const range = { min: -200, max: 200, expo: 1 }

    expect(normToNumber(0, range)).toBe(-200)
    expect(normToNumber(0.25, range)).toBe(-50)
    expect(normToNumber(0.5, range)).toBe(0)
    expect(normToNumber(0.75, range)).toBe(50)
    expect(normToNumber(1, range)).toBe(200)

    expect(numberToNorm(50, range)).toBe(0.75)
  })

  test("Metric", () => {
    // Read number with metric notation.
    expect(stringToNumber("1M", { metric: true })).toBe(1e6)
    expect(stringToNumber("1m", { metric: true })).toBe(1e-3)

    // Format numbers to metric
    expect(numberToString(1e-3, { metric: true })).toBe("1m")
    expect(numberToString(1e-6, { metric: true })).toBe("1μ")

    // Optionally, avoid using the μ character
    expect(
      numberToString(1e-6, { metric: true, metricScale: ScaleAscii })
    ).toBe("1u") // Use only a given range within metric scale

    expect(
      numberToString(1e-3, { metric: true, metricMin: 1, metricMax: 1000 })
    ).toBe("0.001")
    expect(
      numberToString(1e3, { metric: true, metricMin: 1, metricMax: 1000 })
    ).toBe("1k")
    expect(
      numberToString(1e6, { metric: true, metricMin: 1, metricMax: 1000 })
    ).toBe("1000k")
  })
})
