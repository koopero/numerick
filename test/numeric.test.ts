import {describe, expect, test} from '@jest/globals'

import { numberToNorm, stringToNumber, numberToString, numberToNumber, normToNumber, NumerickConfig, checkConfig, metricScaleAscii, metricScaleBinary, metricScaleBinaryParse,metricScaleBinaryShort, metricScaleParse } from '../src/numerick'
import { testConversions } from './testutil'

describe('config round-trip', () => {
  testConversions('min & max', { min: 0, max: 200 } )
  testConversions('radix: 6', { radix: 6 } )
  testConversions('metric', { max: 1e24, metric: true } )

  // testConversions('min, expo', { min: -1, max: 2, expo: 1 } )
  testConversions('min, max, origin, expo', { min: -100, origin: 0, max: 1000, expo: 1 } )
})

describe('examples from readme', () => {
  test('Parsing', () => {
    expect( stringToNumber( '1.234k', { metric: true } ) ).toBe(1234)
    expect( stringToNumber( '1110.01', { radix: 2 } ) ).toBe(14.25)
  })
  test('Formatting', () => {
    expect( numberToString( 1234, { separator: ',', padStart: true, length: 8, unit: 'u' } ) ).toBe('  1,234u')

  })
  test('Normalized Numbers', () => {
    const range = { min: -200, max: 200, expo: 1 }

    expect( normToNumber( 0,    range )).toBe( -200 )
    expect( normToNumber( 0.25, range )).toBe( -50 )
    expect( normToNumber( 0.5,  range )).toBe( 0 )
    expect( normToNumber( 0.75, range )).toBe( 50 )
    expect( normToNumber( 1,    range )).toBe( 200 )

    expect( numberToNorm( 50, range )).toBe( 0.75 )
  })
  
  test('Metric', () => {
    // Read number with metric notation.
    expect( stringToNumber( '1M', { metric: true } )).toBe(1e6)
    expect( stringToNumber( '1m', { metric: true } )).toBe(1e-3)

    // Format numbers to metric
    expect( numberToString( 1e-3, { metric: true } )).toBe('1m')
    expect( numberToString( 1e-6, { metric: true } )).toBe('1μ')

    // Optionally, avoid using the μ character
    expect( numberToString( 1e-6, { metric: true, metricScale: metricScaleAscii } )).toBe('1u')

    // Use only a given range within metric scale
    expect( numberToString( 1e-3, { metric: true, metricMin: 1, metricMax: 1000 } )).toBe('0.001')
    expect( numberToString( 1e3, { metric: true, metricMin: 1, metricMax: 1000 } )).toBe('1k')
    expect( numberToString( 1e6, { metric: true, metricMin: 1, metricMax: 1000 } )).toBe('1000k')
  })

  test('Binary Metric', () => {
    // Read binary metric numbers with loose formatting
    expect( stringToNumber( '64k', { metric: true, metricScale: metricScaleBinaryParse } ) ).toBe( 65536 )
    expect( stringToNumber( '32Kib', { metric: true, metricScale: metricScaleBinaryParse } ) ).toBe( 32768 )

    // Format binary metric numbers with correct prefixes
    expect( numberToString( 4096, { metric: true, metricScale: metricScaleBinary } ) ).toBe( '4Ki' )

    // Format binary metric numbers with short, incorrect prefixes
    expect( numberToString( 2**21, { metric: true, metricScale: metricScaleBinaryShort } ) ).toBe( '2m' )
  })
})

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

describe('numberToNumber', () => {
  test('passes number without options', () => {
    expect( numberToNumber( 1 ) ).toBe(1)
    expect( numberToNumber( 42 ) ).toBe(42)
    expect( numberToNumber( -100 ) ).toBe(-100)
  })

  test('will apply step', () => {
    const config = { step: 1, bias: 0 }
    expect( numberToNumber( 1,   config ) ).toBe( 1 )
    expect( numberToNumber( 1.5, config ) ).toBe( 1 )
    expect( numberToNumber( 2.5, config ) ).toBe( 2 )
  })

  test('will clamp', () => {
    const config = { clamp: true }
    expect( numberToNumber( -1, config ) ).toBe( 0 )
    expect( numberToNumber(  1, config ) ).toBe( 1 )
    expect( numberToNumber(  2, config ) ).toBe( 1 )
  })
})

describe('stringToNumber', () => {
  test('works with no arguments', () => {
    expect( stringToNumber('0') ).toBe( 0 )
    expect( stringToNumber('1') ).toBe( 1 )
    expect( stringToNumber('1.5') ).toBe( 1.5 )
  })

  test('will support metric', () => {
    const config = { metric: true }
    expect( stringToNumber('1k', config ) ).toBe( 1000 )
    expect( stringToNumber('1M', config ) ).toBe( 1000000 )
    expect( stringToNumber('1m', config ) ).toBe( 0.001 )
  })
})

describe('config.expo', () => {
  describe('normToNumber', () => {
    test('standard expo', () => {
      const config = {
        expo: 1,
      }
  
      expect( normToNumber( 0, config ) ).toBe( 0 )
      expect( normToNumber( 0.5, config ) ).toBe( 0.25 )
      expect( normToNumber( 1, config ) ).toBe( 1 )
    })
  })
})

describe('config.radix', () => {
  describe('stringToNumber', () => {
    test('will work', () => {
      expect( stringToNumber('10', { radix: 2 } )).toBe(2)
      expect( stringToNumber('z', { radix: 36 } )).toBe(35)
    })

    test('will return NaN for invalid radix', () => {
      expect( stringToNumber('foo', { radix: 0 } ) ).toBe( NaN )
      expect( stringToNumber('foo', { radix: 1 } ) ).toBe( NaN )
      expect( stringToNumber('foo', { radix: -1 } ) ).toBe( NaN )
      expect( stringToNumber('foo', { radix: 0.5 } ) ).toBe( NaN )
      expect( stringToNumber('foo', { radix: 37 } ) ).toBe( NaN )
    })
  })

  describe('numberToString', () => {
    test('will work', () => {
      expect( numberToString( 2, { radix: 2 } )).toBe('10')
      expect( numberToString( 37, { radix: 36 } )).toBe('11')
    })
  })

  describe('checkConfig', () => {
    test('will return error for bad radix', () => {
      const config = { radix: 37 }
      const errors = checkConfig( config )
      expect( errors.length ).toBe( 1 )
      const [ error ] = errors
      expect( error.key ).toBe('radix')
    })
  } )

  test('binary fractions', () => {
    const config = { radix: 2 }
    expect( stringToNumber('0.1',config)).toBe( 0.5 )
    expect( stringToNumber('0.01',config)).toBe( 0.25 )
  })
} )

describe('config.metric', () => {
  test('stringToNumber', () => {
    const config = { metric: true }
    expect( stringToNumber('1k', config ) ).toBe( 1000 )
    expect( stringToNumber('1M', config ) ).toBe( 1000000 )
    expect( stringToNumber('1m', config ) ).toBe( 0.001 )
  })

  test('numberToString', () => {
    const config = { metric: true }
    expect( numberToString(1100, config ) ).toBe( '1.1k' )
  })
})

describe('config.metricScale', () => {
  const metric = true
  describe('checkConfig', () => {

    const testForError = ( config, errorType = 'error' ) => {
      const errors = checkConfig( config )
      expect( errors.length ).toBe( 1 )
      const [ error ] = errors
      expect( error.key ).toBe('metricScale')
      expect( error.type ).toBe( errorType )
    }

    test('metricScaleParse passes', () => {
      const errors = checkConfig( { metric: true, metricScale: metricScaleParse } )
      expect( errors.length ).toBe( 0 )
    })

    test('Bad scales', () => {
      // Out of order
      testForError( { metric, metricScale: {
        'a': 1,
        'b': 1000,
      }})

      // No one
      testForError( { metric, metricScale: {
        'a': 1000,
        'b': 0.001,
      }}, 'warning')

      // No one
      testForError( { metric, metricScale: {
        'a': NaN,
        'b': 'foo',
      }})
    })
  })
})

describe('config.metricFudge', () => {
  test('numberToString', () => {
    const metric = true
    expect( numberToString(1100000, { metric, metricFudge: 1e1 } ) ).toBe( '1100k' )
    expect( numberToString(1100000, { metric, metricFudge: 1 } ) ).toBe( '1.1M' )
    expect( numberToString(1100000, { metric, metricFudge: 1e-3 } ) ).toBe( '0.0011G' )
  })

  test('with padding', () => {
    const metric = true
    expect( numberToString(1100000, { metric, length: 8, padZero: true } ) ).toBe( '1.10000M' )
  })
})

describe('config.separateDigits', () => {
  test('will format in Indian style', () => {
    expect( numberToString( 1e6, { separator: ',', separateDigits: [3,2] } ) ).toBe('10,00,000')
    expect( numberToString( 1e5, { separator: ',', separateDigits: [3,2] } ) ).toBe('1,00,000')
    expect( numberToString( 1e4, { separator: ',', separateDigits: [3,2] } ) ).toBe('10,000')
  })
})

describe('separators', () => {
  test('will format not add unnecessary separators', () => {
    expect( numberToString( 1e2, { separator: '_' } ) ).toBe('100')
    expect( numberToString( -1e2, { separator: '_' } ) ).toBe('-100')
  })

  test('will format in javascript style', () => {
    expect( numberToString( 1e6, { separator: '_' } ) ).toBe('1_000_000')
  })
  
  test('will parse numbers with common separators', () => {
    expect( stringToNumber( '1_0_0_0' ) ).toBe(1000)
    expect( stringToNumber( `1'0'0'0` ) ).toBe(1000)
  })

  test('will parse numbers with arbitrary separators', () => {
    expect( stringToNumber( '1Z0Z0Z0', { separators: 'Z' } ) ).toBe(1000)
  })
})

describe('config.negative', () => {
  test('will handle weird parameters', () => {
    const config : NumerickConfig = {
      negative: 'n'
    }

    expect( numberToString( -1, config ) ).toBe('n1')
    expect( stringToNumber( 'n1', config ) ).toBe(-1)
  })
})

describe('config.positive', () => {
  test('will handle weird parameters', () => {
    const config : NumerickConfig = {
      positive: 'p'
    }

    expect( numberToString( 1, config ) ).toBe('p1')
    expect( stringToNumber( 'p1', config ) ).toBe(1)
  })
})

describe('config.length', () => {
  describe('numberToString', () => {
      
    test('with padStart', () => {
      const config = {
        length: 4,
        padStart: true,
      }
      expect( numberToString(  1, config ) ).toBe( '   1' )
      expect( numberToString( -1, config ) ).toBe( '  -1' )
    })

    test('with padStart + padZero', () => {
      const config = {
        length: 4,
        padStart: true,
        padZero: true,
      }
      expect( numberToString(  1, config ) ).toBe( '0001' )
      expect( numberToString( -1, config ) ).toBe( '-001' )
    })

    test('with padZero', () => {
      const config = {
        length: 4,
        padZero: true,
      }
      expect( numberToString(  1, config ) ).toBe( '1.00' )
      expect( numberToString( -1, config ) ).toBe( '-1.0' )
    })

    test('with padZero + positive', () => {
      const config = {
        length: 5,
        padZero: true,
        positive: '+',
      }
      expect( numberToString(  1.1, config ) ).toBe( '+1.10' )
      expect( numberToString( -1.1, config ) ).toBe( '-1.10' )
    })

    test('with padStart + positive + precision + unit', () => {
      const config = {
        length: 9,
        padStart: true,
        positive: '+',
        precision: 4,
        unit: 'q',
      }
      expect( numberToString(  1.1, config ) ).toBe( '  +1.100q' )
      expect( numberToString( -1.1, config ) ).toBe( '  -1.100q' )
    })

    test('is overridden by precision', () => {
      const config = {
        length: 4,
        precision: 6,
      }
      expect( numberToString(  1.1, config ) ).toBe( '1.10000' )
    })
  })
})

describe('config.nanString', () => {
  test('works', () => {
    const nanString = 'notANumber'
    const config = { nanString }
    expect( numberToString( NaN, config ) ).toBe( nanString )
  })
})

describe('config.nanValue', () => {
  test("stringToNumber", () => {
    // Don't do this!
    const nanValue = 666
    const config = { nanValue }
    expect( stringToNumber( 'NaN', config ) ).toBe( nanValue )
  })

  test("numberToNumber", () => {
    const nanValue = 666
    const config = { nanValue }
    expect( numberToNumber( NaN, config ) ).toBe( nanValue )
  })
})

describe('config.signZero', () => {
  test('numberToString', () => {
    const config = { 
      signZero: true,
      positive: '+',
    }
    expect( numberToString( -0, config ) ).toBe( '-0' )
    expect( numberToString(  0, config ) ).toBe( '+0' )
  })
})

describe('config.clamp', () => {
  test('numberToNorm', () => {
    const config = { min: -2, max: 2, clamp: true }
    expect( numberToNorm( -3, config ) ).toBe( 0 )
    expect( numberToNorm( -2, config ) ).toBe( 0 )
    expect( numberToNorm( -1, config ) ).toBe( 0.25 )
    expect( numberToNorm( 0, config ) ).toBe( 0.5 )
    expect( numberToNorm( 1, config ) ).toBe( 0.75 )
    expect( numberToNorm( 2, config ) ).toBe( 1 )
    expect( numberToNorm( 3, config ) ).toBe( 1 )
  })
})

describe('config.bias', () => {
  describe('numberToNumber', () => {
    test('rounds up and down', () => {
      const step = 3
      expect( numberToNumber( 0, { step, bias: 0 } ) ).toBe( 0 )
      expect( numberToNumber( 1, { step, bias: 0 } ) ).toBe( 0 )
      expect( numberToNumber( 2, { step, bias: 0 } ) ).toBe( 0 )
      expect( numberToNumber( 3, { step, bias: 0 } ) ).toBe( 3 )

      expect( numberToNumber( 0, { step, bias: 0.5 } ) ).toBe( 0 )
      expect( numberToNumber( 1, { step, bias: 0.5 } ) ).toBe( 0 )
      expect( numberToNumber( 2, { step, bias: 0.5 } ) ).toBe( 3 )
      expect( numberToNumber( 3, { step, bias: 0.5 } ) ).toBe( 3 )
      
      expect( numberToNumber( 0, { step, bias: 1 } ) ).toBe( 0 )
      expect( numberToNumber( 1, { step, bias: 1 } ) ).toBe( 3 )
      expect( numberToNumber( 2, { step, bias: 1 } ) ).toBe( 3 )
      expect( numberToNumber( 3, { step, bias: 1 } ) ).toBe( 3 )
    })
  })
})

describe('scientific notation', () => {
  test('will parse by default', () => {
    expect( stringToNumber( '1e1' ) ).toBe( 10 )
    expect( stringToNumber( '1e+2' ) ).toBe( 100 )
    expect( stringToNumber( '1e0' ) ).toBe( 1 )
    expect( stringToNumber( '1e-1' ) ).toBe( 0.1 )
  })

  test('will use non-standard denotation', () => {
    const config = {
      scientificString: 'FFF'
    }
    expect( stringToNumber( '1FFF1', config ) ).toBe( 10 )
    expect( stringToNumber( '1FFF+2', config ) ).toBe( 100 )
    expect( stringToNumber( '1FFF0', config ) ).toBe( 1 )
    expect( stringToNumber( '1FFF-1', config ) ).toBe( 0.1 )
  })

  test('will output string', () => {
    const config = {
      scientific: true
    }
    expect( numberToString( 0, config ) ).toBe( '0e+0')
    expect( numberToString( 120, config ) ).toBe( '1.2e+2')
  })
})

describe('weird stuff you should probably not do', () => {
  test('combine radix and scientific', () => {
    const config = {
      scientific: true,
      radix: 2,
    }

    expect( numberToString( 70, config ) ).toBe( '111e+1')
    expect( stringToNumber( '111e+1', config ) ).toBe( 70 )
  })
})
