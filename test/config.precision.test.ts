import { numberToString } from "../src"


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


describe("config.precisionMax", () => {
  test("show many digits", () => {
    const config = { precisionMax: 6 }
    expect(numberToString(1.23456789, config)).toBe("1.23456")
  })
})
