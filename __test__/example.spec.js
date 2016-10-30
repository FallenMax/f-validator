/* eslint-env jest */

it('README.md#Example is correct', () => {

  const { string, number, optional, or, objectOf, arrayOf, error } = require('../lib/f-validator')
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


})
