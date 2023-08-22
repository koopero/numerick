import {describe, expect, test} from '@jest/globals'
import { normToNumber, numberToNorm, normToString, stringToNorm, NumerickConfig, numberToNumber } from '../src/numerick'

import * as asciichart from 'asciichart'


export function testConversions( name:string, config:NumerickConfig  ) {
  describe(name,() => {
    const div = 100

    test('norm <-> number', () => {
      for( let index = 0; index <= div; index++ ) {
        const norm = index / div
        const number = normToNumber( norm, config )
        const backToNorm = numberToNorm( number, config )
        expect( backToNorm ).toBeCloseTo( norm, 2 )
      }
    })

    test('norm -> number -> number', () => {
      for( let index = 0; index <= div; index++ ) {
        const norm = index / div
        const number = normToNumber( norm, config )
        const anotherNumber = numberToNumber( number, config )
        expect( number ).toBeCloseTo( anotherNumber )
      } 
    })

    test('norm <-> string', () => {
      for( let index = 0; index <= div; index++ ) {
        const norm = index / div
        const string = normToString( norm, config )
        const backToNumber = normToNumber( norm, config )
        const backToNorm = stringToNorm( string, config )
        expect( backToNorm ).toBeCloseTo( norm, 2 )
      }
    })
  })
}

export function expoGraph( name: string, config:NumerickConfig ) {
  describe(name,() => {
    test('expo graph above ^', () => {
      const div = 160
      const data = []
      for( let index = 0; index <= div; index++ ) {
        const norm = index / div
        const number = normToNumber( norm, config )
        data.push( number )
      }

      console.log ( `expoGraph::${name} ${JSON.stringify(config)}\n\n${asciichart.plot (data, { height: 40 })}`)
    })
  })
}