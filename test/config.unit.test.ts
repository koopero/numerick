import { numberToString, parseValue } from "../src"

describe("config.unit", () => {
  describe("parseValue", () => {
    test("Captures unicode unit", () => {
      const unit = "°"
      const config = { unit }
      const number = 270
      const string = numberToString(number, config)
      const result = parseValue(string)
      expect(result.unit).toBe(unit)
      expect(result.value).toBe(number)
    })
  })
})

