import { stringToNumber, numberToString, parseValue } from "../src"
import { parseNumberRegex } from "../src/parse"


describe("config.pointUnit", () => {
  test("stringToNumber", () => {
    const config = { pointUnit: true }
    console.log(parseNumberRegex(config))
    expect(stringToNumber("3V3", config)).toBe(3.3)
    expect(stringToNumber("1234A5", config)).toBe(1234.5)
  })

  test("numberToString", () => {
    const config = { pointUnit: true, unit: "V" }
    expect(numberToString(3.3, config)).toBe("3V3")
  })

  test("parseValue", () => {
    const config = { pointUnit: true }
    expect(parseValue("3V3", config)).toMatchObject({ 
      value: 3.3, unit: "V" 
    })
  })
})