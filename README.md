`numerick` is a module for the parsing & formatting of numbers in a variety of human-friendly formats, as well conversion to and from normalized forms.


# Usage

## Parsing
``` js
import { stringToNumber } from 'numerick'

stringToNumber( '1.234k', { metric: true } ) == 1234
stringToNumber( '1110.01', { radix: 2 } ) == 14.25
```

## String Formatting
``` js
import { numberToString } from 'numerick'

numberToString( 1234, { separator: ',', padStart: true, length: 8, unit: 'u' } ) == '  1,234u'
```

## HTML Formatting

``` jsx
import { numberFormat } from 'numerick'

const config = {
  precision: 4,
  unit: 'b'
}

const [
    prefix, // Supplied prefix, plus left padding.
    sign, // "-" or blank
    nan, // "NaN", "Infinity" or blank.
    whole, // Integer portion of number, including separators
    point, // Decimal point "."
    fract, // Fractional portion of number.
    multiplier, // Metric multiplier, or "e" for scientific form.
    exponent, // Numeric portion of scientific form.
    unit, // Unit as supplied.
] = numberFormat( 1234.5678, config )

<span>
  <span>{ prefix }</span>
  <span>{ sign }</span>
  <span>{ nan }</span>
  <span>{ whole }</span>
  <span>{ point }</span>
  <span>{ fract }</span>
  <span>{ multiplier }</span>
  <span>{ exponent }</span>
  <span>{ unit }</span>
</span>
```

## Normalized Numbers

``` js
import { normToNumber, numberToNorm } from 'numerick'

// Apply a range and expo rate to normalized values.
const range = { min: -200, max: 200, expo: 1 }

normToNumber( 0,    range ) == -200
normToNumber( 0.25, range ) == -50
normToNumber( 0.5,  range ) == 0
normToNumber( 0.75, range ) == 50
normToNumber( 1,    range ) == 200

// Operations are reversible
numberToNorm( 50, range ) == 0.75
```

# Metric

``` js
import {
  stringToNumber, numberToString,
  metricScaleAscii
} from 'numerick'

// Read number with metric notation.
stringToNumber( '1M', { metric: true } ) == 1e6
stringToNumber( '1m', { metric: true } ) == 1e-3

// Format numbers to metric
numberToString( 1e-3, { metric: true } ) == '1m'
numberToString( 1e-6, { metric: true } ) == '1μ'

// Optionally, avoid using the μ character
numberToString( 1e-6, { metric: true, metricScale: metricScaleAscii } ) == '1u'

// Use only a given range within metric scale
numberToString( 1e-3, { metric: true, metricMin: 1, metricMax: 1000 } ) == '0.001'
numberToString( 1e3, { metric: true, metricMin: 1, metricMax: 1000 } ) == '1k'
numberToString( 1e6, { metric: true, metricMin: 1, metricMax: 1000 } ) == '1000k'

```

## Binary Metric
``` js
import { 
  stringToNumber, numberToString, 
  metricScaleBinary,
  metricScaleBinaryParse,
  metricScaleBinaryShort, 
} from 'numerick'

// Read binary metric numbers with loose formatting
stringToNumber( '64k', { metric: true, metricScale: metricScaleBinaryParse } ) == 65536
stringToNumber( '32Kib', { metric: true, metricScale: metricScaleBinaryParse } ) == 32768

// Format binary metric numbers with correct prefixes
numberToString( 4096, { metric: true, metricScale: metricScaleBinary } ) == '4Ki'

// Format binary metric numbers with short, incorrect prefixes
numberToString( 2**21, { metric: true, metricScale: metricScaleBinaryShort } ) == '2m'
```

# Functions

### numberToString( value:number, config:NumerickConfig = {} ) : string

### stringToNumber( value:string, config:NumerickConfig = {} ) : number

### stringToNumberUnit( value:string, config:NumerickConfig = {} ) : { value: number, unit: string }

### normToNumber( value:number, config:NumerickConfig = {} ) : number

### numberToNorm( value:number, config:NumerickConfig = {} ) : number

### stringToNorm( string:number, config:NumerickConfig = {} ) : number

### normToString( value:number, config:NumerickConfig = {} ) : string

### normStep( config:NumerickConfig = {} ) : number



### checkConfig( config: NumerickConfig ) : { key:string, type:'warning' | 'error', message:string }[]

# Configuration

## Ranges

### `min`, `max` : number = `0, 1`

Define the expected range of numbers. When converting to and from normalized form, `min` will be `0` and `max` will be `1`. 

### `clamp` : boolean = `false`

If set, confine numbers to between `min` & `max`, inclusive.

## Quantization

### `step`: number = `0`
### `quant` : number = `0.00000125`
### `bias`: number = `0.5`

Apply rounding when quantizing numbers. `0` is equivalant to `floor`, `0.5` to `round` and `1` to `ceil`.

## Expo

### `expo`: number = `0`

Apply an exponential rate to normalized values. This can be used to make controls progressively more responsive at higher values. An `expo` value of `1` is equivalent to `pow(value,2)`. Ranges are normalized to `min`, `max` and `origin`.

### `origin`: number = `0`

Use a custom centre for `expo`, as well as quantization. For instance, for a bi-directional R/C control, you might use something like `{ min: 1000, origin: 1500, max: 2000 }`.

### `deadzone`: number = `0`

When converting from normalized values, apply a 'deadzone' around `origin`, where `abs(value-origin) < deadzone` will map to `origin`. Values will be scaled so that `min`, `max` and `origin` as preserved.

## String formatting

### `length`: number = `0`

If non-zero, attempt to format a string of a given length, using fractional digits or padding. The length will include `prefix` & `unit`. If `precision` is specified, or the integer portion of the number is too long, the actual length of the string may exceed `length`.

### `prefix`: string = `''`
### `radix`: number = `10`

*Note: Floating point numbers with radix other than 10 may have bugs!*

### `precision`: number = `0`

Force a given number of fractional digits ( including decimal point ) when formatting, equivalent to the Javascript `toPrecision` function.

### `padStart`: boolean = `false`

If used in conjunction with `padZero`, the string will be padded with zero rather than spaces.

### `padZero`: boolean = `false`
### `signZero`: boolean = `false`

Whether to format negative-zero with sign.

### `nanString`: string = `'NaN'`

String to use when formatting `NaN`.

### `nanValue`: number = `NaN`

Number to return when parsed string input is invalid.

### `scientific`: boolean = *true* for parsing, *false* for formatting.

Format numbers in scientific notation, similar to the `toExponential` function. For example, `1000` -> `1e+3`. Note, exponential portion of scientific notation will always use a radix of `10`, regardless of the `radix` option.

### `metric`: boolean = `false`

### `metricFudge`: number

### `metricMin`: number

### `metricMax`: number


### `unit`: string = ''

## Separators

### `separator`: string = `''`

Use a specific character to separate digit groups when formatting numbers. For example, `'_'` will produce strings in Javacript-compatible `'1_000_000'` format. 

### `separateDigits`: number | number[] = `3`

The size of digit groups when using `separator`. May be an `array` for variable group size, such as `[3,2]` for Indian-style (1,000,000,00) numbers.

### `separators`: string | string[] = `',_\''`

Accept custom characters as digit group separators when parsing. Note that when parsing, the size of digit groups is ignored.

## Additional String Formatting

### `negative`: string = '-'

If specified, use an alternate prefix for negative numbers.

### `positive`: string = ''

If specified, denote positive numbers by prefixing with a given string. For example, `'+'`.

### `point`: string = `'.'`

If specified, use a specific string as the decimal point when formatting or parsing numbers. For example, `','` for European-style formatting.

### `scientificString`: string = `'e'`

Optionally, replace the `'e'` character in scientific-form numbers with a given string.

### `charset`: string
