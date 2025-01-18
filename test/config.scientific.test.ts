import { stringToNumber, numberToString, parseValue } from "../src"

describe("config.scientific", () => {
  test("will parse by default", () => {
    expect(stringToNumber("1e1")).toBe(10)
    expect(stringToNumber("1e+2")).toBe(100)
    expect(stringToNumber("1e0")).toBe(1)
    expect(stringToNumber("1e-1")).toBe(0.1)
  })

  test("it will turn off", () => {
    expect(parseValue("1e3", { scientific: false })).toMatchObject({
      value: 1,
      unit: "e3",
    })
  })
  
  test("will use non-standard denotation", () => {
    const config = {
      scientificString: "FFF",
    }
    expect(stringToNumber("1FFF1", config)).toBe(10)
    expect(stringToNumber("1FFF+2", config)).toBe(100)
    expect(stringToNumber("1FFF0", config)).toBe(1)
    expect(stringToNumber("1FFF-1", config)).toBe(0.1)
  })

  test("will output string", () => {
    const config = {
      scientific: true,
    }
    expect(numberToString(0, config)).toBe("0e+0")
    expect(numberToString(120, config)).toBe("1.2e+2")
    expect(numberToString(0.1, config)).toBe("1e-1")
  })
})
