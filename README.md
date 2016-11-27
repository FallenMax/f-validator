# F-Validator

Functional JSON validator

## Features

- Minimal, ~200 LoC, no dependencies.
- Simple, validators are just functions, no special DSL to learn
- Powerful, compose basic/custom validators to build complex ones

## Installation

`npm install --save f-validator`

## Get started

```javascript

  const { string, number, optional, or, objectOf, arrayOf, error } = require('f-validator')
  const equal = require('assert').deepStrictEqual


  // Every validator is just a function
  const validator1 = string
  equal(validator1('I am a string'), null) // passed check -> null


  // Some validator can use other validators
  // e.g. `or`, `optional`, `objectOf`, `arrayOf`
  const validator2 = or(string, number)


  // To validate object, `objectOf` takes a schema where each field is a validator
  const validator3 = objectOf({
    a: or(string, number),
    b: objectOf({
      c: optional(string)
    })
  })


  // To validate array, `arrayOf` takes a validator which will be used to check every element
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


  // Sometimes, you'll need your own validator
  // any function can be used as a 'Validator' if it has this signature:

  /**
   * @param any subject, subject to check
   * @param []string path, a key-path pointing to the field
   * @returns
   *   null, if it passes the check
   *   Object error, an error object created with `error` utility
   */

  // Example 1: a humble even number validator
  const evenNumber = (subject, path = []) => {
    if (typeof subject == 'number' && (subject % 2 === 0)) {
      return null
    } else {
      return error(path, 'an even number', subject) // keypath, expected, received
    }
  }

  // now it can be used by other validator
  const arrayOfEvenNumber = arrayOf(evenNumber)
  equal(arrayOfEvenNumber([2, 4, 6, 9]), {
    path: [3], // the 4th element
    expected: 'an even number',
    received: 9,
    message: 'Path:\'3\', Expected: an even number, Received: \'9\''
  })

  // Example 2:  a stringified-json-object-conforming-to-a-given-validator validator
  const jsonString = validator =>
    (subject, path = []) => {
      let parsed
      try {
        parsed = JSON.parse(subject)
      } catch (e) {
        return error(path, `json string of (${validator.name})`, subject)
      }
      return validator(parsed, path) // note: `path` should be passed to it
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

`regex(re:regexp)` - valid if **value** matches regex `re`

### 3. Composite type validators:

`objectOf(schema:object)` - valid if **value** is an object where for every `key` of `schema`, `value[key]` is validated by `schema[key]`

`arrayOf(v:Validator)` - valid if **value** is an array where every element is validated by `v`


### 4. Logical validators:

`not(v:validator)` - valid if **value** is invalidated by `v`

`any` - always valid

`and(...vs:[]validator)` - valid if **value** is validated by every validator of `vs`

`or(...vs:[]validator)` - valid if **value** is validated by every validator of `vs`

`optional(v:validator)` - valid if **value** is either validated by `v` or null/undefined

`is(ref:any)` - valid if **value** is strictly deeply equal to `ref`

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



