
enum Unit {
  Meter = "meter",
  Mile = "mile",
  Foot = "foot",
  Inch = "inch",
  Yard = "yard",
  Second = "second",
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Degree = "degree",
  Radian = "radian",
  Gradian = "gradian",
  Turn = "turn",
  MetricTonne = "tonne",
  ShortTon = "ton",
  LongTon = "ton",
  Pound = "pound",
}

const UnitAliases = {
  "m": Unit.Meter,
  "ft": Unit.Foot,
  "'": Unit.Foot,
  "\"": Unit.Inch,
  "in": Unit.Inch,
  "mi": Unit.Mile,
  "yd": Unit.Yard,
  "s": Unit.Second,
  "min": Unit.Minute,
  "h": Unit.Hour,
  "d": Unit.Day,
  "deg": Unit.Degree,
  "rad": Unit.Radian,
  "grad": Unit.Gradian,
  "lb": Unit.Pound,
}


const conversions = [
  [ "m", "mile", ( a ) => a * 1609.344 ],
  [ "mile", "m", ( a ) => a / 1609.344 ],
  [ "m", "ft", ( a ) => a * 3.28084 ],
  [ "ft", "m", ( a ) => a / 3.28084 ],
  [ "m", "in", ( a ) => a * 39.3701 ],
  [ "in", "m", ( a ) => a / 39.3701 ],
  [ "m", "yd", ( a ) => a * 1.09361 ],
  [ "yd", "m", ( a ) => a / 1.09361 ],

  [ "deg", "rad", ( a ) => a * Math.PI / 180 ],
  [ "rad", "deg", ( a ) => a * 180 / Math.PI ],
  [ "deg", "grad", ( a ) => a * 200 / 180 ],
  [ "grad", "deg", ( a ) => a * 180 / 200 ],
  [ "deg", "turn", ( a ) => a / 360 ],
  [ "turn", "deg", ( a ) => a * 360 ],
  [ "kg", "lb", ( a ) => a * 2.20462 ],
  [ "lb", "kg", ( a ) => a / 2.20462 ],
  [ "kg", "oz", ( a ) => a * 35.274 ],
  [ "oz", "kg", ( a ) => a / 35.274 ],
  [ "kg", "t", ( a ) => a / 1000 ],
  [ "t", "kg", ( a ) => a * 1000 ],

  [ "m/s", "km/h", ( a ) => a * 3.6 ],
  [ "km/h", "m/s", ( a ) => a / 3.6 ],
  [ "m/s", "mi/h", ( a ) => a * 2.23694 ],
  [ "mi/h", "m/s", ( a ) => a / 2.23694 ],
  [ "m/s", "ft/s", ( a ) => a * 3.28084 ],
  [ "ft/s", "m/s", ( a ) => a / 3.28084 ],
  [ "m/s", "kn", ( a ) => a * 1.94384 ],
  [ "kn", "m/s", ( a ) => a / 1.94384 ],
  [ "m/s", "mach", ( a ) => a / 343 ],
  [ "mach", "m/s", ( a ) => a * 343 ],
  [ "m/s", "c", ( a ) => a / 299792458 ],
  [ "c", "m/s", ( a ) => a * 299792458 ],


  [ "second", "minute", ( a ) => a / 60 ],
  [ "minute", "second", ( a ) => a * 60 ],
  [ "minute", "hour", ( a ) => a / 60 ],
  [ "hour", "minute", ( a ) => a * 60 ],
  [ "hour", "day", ( a ) => a / 24 ],
  [ "day", "hour", ( a ) => a * 24 ],
]

function convertUnit( value, from, to ) {
  const conversion = conversions.find( ( [ a, b ] ) => a === from && b === to )
  if ( !conversion ) throw new Error( `Cannot convert ${from} to ${to}` )
  return conversion[ 2 ]( value )
}