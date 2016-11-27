/* eslint-env jest */

it('README.md#Examples are correct', () => {

  const { string, number, optional, or, objectOf, arrayOf, error } = require('../index')
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



})
