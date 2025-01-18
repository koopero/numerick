import { 
  normToNumber,
  numberToNorm,
  checkConfig,
} from "../src"

describe("config.logarithmic", () => {
  describe("basic", () => {
    const config = {
      logarithmic: true,
      min: 1,
      max: 4,
    }

    test("normToNumber", () => {
      expect(normToNumber(0, config)).toBeCloseTo(1)
      expect(normToNumber(0.5, config)).toBeCloseTo(2)
      expect(normToNumber(1, config)).toBeCloseTo(4)
    })

    test("numberToNorm", () => {
      expect(numberToNorm(1, config)).toBeCloseTo(0)
      expect(numberToNorm(2, config)).toBeCloseTo(0.5)
      expect(numberToNorm(4, config)).toBeCloseTo(1)
    })
  })

  describe("shifted origin", () => {
    const config = {
      logarithmic: true,
      origin: -1,
      min: 0,
      max: 3,
    }

    test("normToNumber", () => {
      expect(normToNumber(0, config)).toBeCloseTo(0)
      expect(normToNumber(0.5, config)).toBeCloseTo(1)
      expect(normToNumber(1, config)).toBeCloseTo(3)
    })

    test("numberToNorm", () => {
      expect(numberToNorm(0, config)).toBeCloseTo(0)
      expect(numberToNorm(1, config)).toBeCloseTo(0.5)
      expect(numberToNorm(3, config)).toBeCloseTo(1)
    })
  })

  describe("error on min == 0", () => {
    test("checkConfig", () => {
      const config = { logarithmic: true }
      const errors = checkConfig(config)
      expect(errors.length).toBe(1)
      const [error] = errors
      expect(error.key).toBe("logarithmic")
      expect(error.type).toBe("error")
    })
  })
})


describe("config.expo", () => {
  describe("normToNumber", () => {
    test("standard expo", () => {
      const config = {
        expo: 1,
      }

      expect(normToNumber(0, config)).toBe(0)
      expect(normToNumber(0.5, config)).toBe(0.25)
      expect(normToNumber(1, config)).toBe(1)
    })
  })
})