describe("config.infinityString", () => {
  const infinityString = "reallyReallyBig"
  const negative = "-" + infinityString
  const config = { infinityString }
  test("stringToNumber", () => {
    expect(stringToNumber("Infinity")).toBe(Infinity)
    expect(stringToNumber(infinityString, config)).toBe(Infinity)
    expect(stringToNumber(negative, config)).toBe(-Infinity)
  })

  test("numberToString", () => {
    expect(numberToString(Infinity)).toBe("Infinity")
    expect(numberToString(-Infinity)).toBe("-Infinity")
    expect(numberToString(Infinity, config)).toBe(infinityString)
    expect(numberToString(-Infinity, config)).toBe(negative)
  })
})




describe("config.charset", () => {
  describe("wacky charsets", () => {
    test("abcd", () => {
      const config = {
        radix: 4,
        charset: ["a", "b", "c", "d"],
      }
      const string = "dcba.abcd"
      const number = 3 * 64 + 2 * 16 + 1 * 4 + 1 / 16 + 2 / 64 + 3 / 256
      expect(numberToString(number, config)).toBe(string)
      expect(stringToNumber(string, config)).toBe(number)
    })
  })

  describe("checkConfig", () => {
    test("Error if charset is too short", () => {
      const config = { charset: "abc" }
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("charset")
      expect(error.type).toBe("error")
    })
  })
})


