import { Metric, stringToNorm, stringToNumber, numberToString, parseValue, checkConfig } from "../src"

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
