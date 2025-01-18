import { stringToNumber, numberToString, checkConfig, parseValue } from "../src"
import { exp } from "../src/math"
describe("config.radix", () => {
  describe("stringToNumber", () => {
    test("will work", () => {
      expect(stringToNumber("10", { radix: 2 })).toBe(2)
      expect(stringToNumber("z", { radix: 36 })).toBe(35)
    })

    test("will return NaN for invalid radix", () => {
      expect(stringToNumber("foo", { radix: 0 })).toBe(NaN)
      expect(stringToNumber("foo", { radix: 1 })).toBe(NaN)
      expect(stringToNumber("foo", { radix: -1 })).toBe(NaN)
      expect(stringToNumber("foo", { radix: 0.5 })).toBe(NaN)
      expect(stringToNumber("foo", { radix: 37 })).toBe(NaN)
    })
  })

  describe("numberToString", () => {
    test("will work", () => {
      expect(numberToString(2, { radix: 2 })).toBe("10")
      expect(numberToString(37, { radix: 36 })).toBe("11")
    })

    test("will handle NaN", () => {
      expect(numberToString(NaN, { precision: 5 })).toBe("NaN")
    })
  })

  describe("checkConfig", () => {
    test("will return error for bad radix", () => {
      const config = { radix: 37 }
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("radix")
    })
  })

  test("binary fractions", () => {
    const config = { radix: 2 }
    expect(stringToNumber("0.1", config)).toBe(0.5)
    expect(stringToNumber("0.01", config)).toBe(0.25)
  })
})



describe("config.radixPrefix", () => {
  test("numberToString", () => {
    const config = { radix: 2, radixPrefix: { "0b": 2 } }
    expect(numberToString(2, config)).toBe("0b10")
  })
  test("stringToNumber", () => {
    const config = { radixPrefix: { "0z": 3, "0y":4 } }
    expect(stringToNumber("0z10", config)).toBe(3)
    expect(stringToNumber("0y20", config)).toBe(8)
    expect(stringToNumber("30", config)).toBe(30)
  })
  test("parseValue", () => {
    const config = { radixPrefix: { "0z": 3 } }
    const result = parseValue("0z10", config)
    expect(result).toMatchObject({ 
      prefix: "0z",
      value: 3
    })
  })
  
})