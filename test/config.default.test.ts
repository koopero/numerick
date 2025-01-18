import { stringToNumber, parseValue } from "../src"

describe("config.default", () => {
  describe("radixPrefix", () => {
    test("uses defaults", () => {
      expect(stringToNumber("10")).toBe(10)
      expect(stringToNumber("0b10")).toBe(2)
      expect(stringToNumber("0x10")).toBe(16)
      expect(stringToNumber("0o10")).toBe(8)
    })

    test("ignores on bad radix!", () => {
      expect(parseValue("0z10")).toMatchObject({ 
        value: 0, 
        unit: "z10",
      })
    })
  })
})