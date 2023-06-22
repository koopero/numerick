import { saturate } from './math'

interface NumerickConfig {
  min?: number,
  max?: number,
  origin?: number,
  expo?: number,
  step?: number,
  quant?: number,
  unit?: string,
  digits?: number,
  negative?: string,
  positive?: string,
  precision?: number,
  metric?: boolean,
  prefix?: string,
  clamp?: boolean,
}

export function normToNumber( value : number, config : NumerickConfig = {} ) {
  const {
    origin = 0,
    expo = 0,
    min = 0,
    max = 1,
    step = 1 / 1000,
    clamp = false,
  } = config

  value =  min + ( max - min ) * value

  return value
}

export function numberToNorm( num : number, config : NumerickConfig = {} ) {
  if ( isNaN( num ) )
    return num

  const {
    origin = 0,
    expo = 0,
    min = 0,
    max = 1,
    step = 1 / 1000,
    clamp = false,
  } = config

  num = ( num - min ) / ( max - min )

  if ( expo ) {

  }

  if ( step ) {
    
  }

  if ( clamp ) {
    num = saturate( num )
  }

  return num

}

export function numberToString( num : number, config : NumerickConfig = {} ) {

}

export function normToString( num : number, config : NumerickConfig = {} ) {

}

export function stringToNorm( str : string, config : NumerickConfig = {} ) {

}

export function stringToNumber( str : string, config : NumerickConfig = {} ) {

}

