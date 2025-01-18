import { parseValue } from "../src/parse"

describe("simple math", () => {
  test("Parse Everthing!", () => {
    const config = { prefix: "~", metric: true}
    const expression = "12_345.6e1mg + 1"
    const result = parseValue( expression, config )
    expect( result ).toMatchObject({
      value: 123.456,
      metric: "m",
      unit: "g",
      remainder: " + 1"
    })
  })

  test("advanced unit", () => {
    const expression = "1.5 m/s"
    const result = parseValue( expression )
    expect( result ).toMatchObject({
      value: 1.5,
      unit: "m/s"
    })
  })

  test("remainder", () => { 
    const expression = "1 + 2"
    const result = parseValue( expression )
    expect( result ).toMatchObject({
      value: 1,
      remainder: "+ 2"
    })
  })
})