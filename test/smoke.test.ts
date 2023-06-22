import {describe, expect, test} from '@jest/globals'

import { numberToNorm } from '../src/index'

describe('numberToNorm', () => {
  test('passes number without options', () => {
    expect( numberToNorm( 1 ) ).toBe(1)
    expect( numberToNorm( 42 ) ).toBe(42)
    expect( numberToNorm( -100 ) ).toBe(-100)
  })

  test('normalizes with ranges', () => {
    expect( numberToNorm( 1, { max: 2 } ) ).toBe(0.5)
  })
})