# F-Validator

Minimal yet powerful JSON validator

## Features

- Minimal, ~200 LoC with no dependencies.
- Simple, validators are just functions (that composes), no schema/DSL to learn
- Powerful, complex validator can be built with basic or custom validators

## Installation

`npm install --save f-validator`

## Examples

```javascript

  const { string, number, optional, or, objectOf, arrayOf, error } = require('f-validator')
  const equal = require('assert').deepStrictEqual

  // Every validator is just a function
  const validator1 = string
  equal(validator1('I am a string'), null) // passed check -> null

  // Some validator can use other validators
  const validator2 = or(string, number)

  // to create an object validator, `objectOf` takes a schema where each field is a validator
  const validator3 = objectOf({
    a: or(string, number),
    b: objectOf({
      c: optional(string)
    })
  })

  // to create an array validator, `arrayOf` takes a validator which checks every element
  const validator4 = arrayOf(validator3)

  const good = {
    a: 5,
    b: {
      c: 'I am also a string'
    }
  }

  const bad = {
    a: 5,
    b: {
      c: 42
    }
  }

  equal(validator4([good, good]), null)
  equal(validator4([good, bad]), { // an object describing the diff
    path: [1, 'b', 'c'], // key-path pointing to the exact field to blame
    expected: 'or(null or undefined, string)',
    received: 42,
    message: 'Path:\'1.b.c\', Expected: or(null or undefined, string), Received: \'42\''
  })

  // sometimes, you need your own validator
  /**
   * Any function can be used as a 'Validator' if it follows this signature:
   *
   * @param Any value  value to check
   * @param Array<String> path  a key-path pointing to the field
   * @returns
   *   null   if it passes the check
   *   error  an object created with `error` utility
   */
  const evenNumber = (value, path = []) => {
    if (typeof value == 'number' && (value % 2 === 0)) {
      return null
    } else {
      return error(path, 'an even number', value) // keypath, expected, received
    }
  }

```


## API


### 1. Error constructor:

`error(path:[]string, expected:string, received:any, message:?string )` - create an error object describing the diff, use it when creating your own validator

### 2. Basic type validators  (most are tested using `Object.prototype.toString.call(value)`)

`object`

`array`

`string`

`number`

`boolean`

`date`

`regexp`

`Null` - *note the initial*

`Undefined` - *note the initial*

`empty` - valid if **value** is `null` or `undefined`

`regex(re:regexp)` - valid if **value** matches regex **re**

### 3. Composite type validators:

`objectOf(schema:object)` - valid if **value** is an object where for every `key` of `schema`, `value[key]` is validated by `schema[key]`

`arrayOf(v:Validator)` - valid if **value** is an array where every element is validated by `v`


### 4. Logical validators:

`not(v:validator)` - valid if **value** is invalidated by `v`

`any` - always valid

`and(...vs:[]validator)` - valid if **value** is validated by every validator of `vs`

`or(...vs:[]validator)` - valid if **value** is validated by every validator of `vs`

`optional(v:validator)` - valid if **value** is either validated by `v` or null/undefined

`is(ref:any)` - valid if **value** is **strictly deeply equal** to `ref`

`oneOf(...refs:[]any)` - valid if **value** is strictly deeply equal to any element of `refs`


### 5. Advanced validator:

`like(ref:any)` - valid if **value** has the same type/structure as `ref` (recursively)

Example:

```javascript

const reference = {
  a: 42,
  b: 'I am string',
  c: {
    d: ['apple']
  },
  e: optional(string)
}

const value = {
  a: 0,
  b: 'I am another string',
  c: {
    d: ['pear', 'microsoft']
  },
  e: 'yep',  // functions in ref are taken as validators
  extra: 'I am an extra field, I will be fine'
}

like(reference)(value) // null (is valid)

```



