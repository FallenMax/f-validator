/* eslint-env jest */
const {
  error,

  object,
  array,
  string,
  number,
  boolean,
  date,
  regexp,
  Null,
  Undefined,
  empty,
  regex,

  not,
  any,
  and,
  or,
  optional,
  is,
  oneOf,
  like,

  objectOf,
  arrayOf,
  jsonString
} = require('../index')


const createError = (path = [], expected, received, message) =>
  ({
    path,
    expected,
    received,
    message: message || `Path:'${path.join('.')}', Expected: ${expected}, Received: '${JSON.stringify(received)}'`
  })
const VALID = null

const tests = [

  {
    desc: 'string ✔️ : ""',
    subject: '',
    schema: string,
    expected: VALID
  },

  {
    desc: 'string ✖️ : 3',
    subject: 3,
    schema: string,
    expected: createError(undefined, 'string', 3)
  },

  {
    desc: 'number ✔️ : 0',
    subject: 0,
    schema: number,
    expected: VALID
  },

  {
    desc: 'number ✖️ : Infinity',
    subject: Infinity,
    schema: number,
    expected: VALID
  },

  {
    desc: 'boolean ✔️ : true',
    subject: true,
    schema: boolean,
    expected: VALID
  },

  {
    desc: 'boolean ✖️ : null',
    subject: null,
    schema: boolean,
    expected: createError(undefined, 'boolean', null)
  },

  {
    desc: 'empty ✔️ : null',
    subject: null,
    schema: empty,
    expected: VALID
  },

  {
    desc: 'empty ✔️ : undefined',
    subject: undefined,
    schema: empty,
    expected: VALID
  },

  {
    desc: 'empty ✖️ : ""',
    subject: '',
    schema: empty,
    expected: createError(undefined, 'null or undefined', '')
  },

  {
    desc: 'object ✔️ : {}',
    subject: {},
    schema: object,
    expected: VALID
  },

  {
    desc: 'object ✖️ : null',
    subject: null,
    schema: object,
    expected: createError(undefined, 'object', null)
  },

  {
    desc: 'object ✖️ : []',
    subject: [],
    schema: object,
    expected: createError(undefined, 'object', [])
  },

  {
    desc: 'array ✔️ : []',
    subject: [],
    schema: array,
    expected: VALID
  },

  {
    desc: 'array ✖️ : 0',
    subject: 0,
    schema: array,
    expected: createError(undefined, 'array', 0)
  },

  {
    desc: 'regex ✔️ : (/test/)) "test"',
    subject: 'test',
    schema: regex(/test/),
    expected: VALID
  },

  {
    desc: 'regex ✖️ : (/test/)) "taste"',
    subject: 'taste',
    schema: regex(/test/),
    expected: createError(undefined, 'match regex(/test/)', 'taste')
  },

  {
    desc: 'not ✔️ : (array) 0',
    subject: 0,
    schema: not(array),
    expected: VALID
  },

  {
    desc: 'not ✖️ : (array) []',
    subject: [],
    schema: not(array),
    expected: createError(undefined, 'not(array)', [])
  },


  {
    desc: 'and ✔️ : (string, regex(/ss/)) "sss"',
    subject: 'sss',
    schema: and(string, regex(/sss/)),
    expected: VALID
  },

  {
    desc: 'and ✖️ : (string, regex(/ss/)) "sas"',
    subject: 'sas',
    schema: and(string, regex(/sss/)),
    expected: createError(undefined, 'match regex(/sss/)', 'sas')
  },

  {
    desc: 'and ✔️ : (string) "sss"',
    subject: 'sss',
    schema: and(string),
    expected: VALID
  },

  {
    desc: 'or ✔️ : (string, number)) "sas"',
    subject: 'sas',
    schema: or(string, number),
    expected: VALID
  },

  {
    desc: 'or ✖️ : (string, number)) []',
    subject: [],
    schema: or(string, number),
    expected: createError(undefined, 'or(string, number)', [])
  },

  {
    desc: 'optional ✔️ : (string) "sas"',
    subject: 'sas',
    schema: optional(string),
    expected: VALID
  },

  {
    desc: 'optional ✔️ : (string) null',
    subject: null,
    schema: optional(string),
    expected: VALID
  },

  {
    desc: 'optional ✖️ : (string) 3',
    subject: 3,
    schema: optional(string),
    expected: createError(undefined, 'or(null or undefined, string)', 3)
  },

  {
    desc: 'is ✔️ : ("test") "test"',
    subject: 'test',
    schema: is('test'),
    expected: VALID
  },

  {
    desc: 'is ✖️ : ("test") "taste"',
    subject: 'taste',
    schema: is('test'),
    expected: createError(undefined, 'is("test")', 'taste')
  },

  {
    desc: 'is ✔️ : objects deep equal',
    subject: { a: { b: { c: 33 } } },
    schema: is({ a: { b: { c: 33 } } }),
    expected: VALID
  },

  {
    desc: 'is ✖️ : objects not deep equal',
    subject: { a: { b: { c: 34 } } },
    schema: is({ a: { b: { c: 33 } } }),
    expected: createError(undefined, `is(${JSON.stringify({ a: { b: { c: 33 } } })})`, { a: { b: { c: 34 } } })
  },

  {
    desc: 'oneOf ✔️ : ("apple", "beer") "apple"',
    subject: 'apple',
    schema: oneOf('apple', 'beer'),
    expected: VALID
  },

  {
    desc: 'oneOf ✖️ : ("apple", "beer") "cat"',
    subject: 'cat',
    schema: oneOf('apple', 'beer'),
    expected: createError(undefined, 'or(is("apple"), is("beer"))', 'cat')
  },

  {
    desc: 'objectOf ✔️ : complex object matching schema',
    subject: {
      parentNumber: 333,
      parentString: 'aaa',
      parentOptional: [],
      parentObject: { c: 'c' },
      child: {
        childNumber: 444,
        childString: 'bbb',
        grandChild: {
          optionalString: 'ccc'
        }
      }
    },
    schema: objectOf({
      parentNumber: number,
      parentString: string,
      parentOptional: optional(array),
      parentObject: object,
      child: objectOf({
        childNumber: number,
        childString: string,
        grandChild: objectOf({
          optionalString: optional(string)
        })
      })
    }),
    expected: VALID
  },

  {
    desc: 'objectOf ✖️ : complex object, field mismatch',
    subject: {
      parentNumber: 333,
      parentString: null, // mismatch
      parentOptional: [],
      parentObject: { c: 'c' },
      child: {
        childNumber: 444,
        childString: 'bbb',
        grandChild: {
          optionalString: 'ccc'
        }
      }
    },
    schema: objectOf({
      parentNumber: number,
      parentString: string,
      parentOptional: optional(array),
      parentObject: object,
      child: objectOf({
        childNumber: number,
        childString: string,
        grandChild: objectOf({
          optionalString: optional(string)
        })
      })
    }),
    expected: createError(['parentString'], 'string', null)
  },


  {
    desc: 'objectOf ✖️ : complex object, deep field mismatch',
    subject: {
      parentNumber: 333,
      parentString: 'aaa',
      parentOptional: [],
      parentObject: { c: 'c' },
      child: {
        childNumber: 444,
        childString: 'bbb',
        grandChild: {
          optionalString: 22 // mismatch
        }
      }
    },
    schema: objectOf({
      parentNumber: number,
      parentString: string,
      parentOptional: optional(array),
      parentObject: object,
      child: objectOf({
        childNumber: number,
        childString: string,
        grandChild: objectOf({
          optionalString: optional(string)
        })
      })
    }),
    expected: createError(['child', 'grandChild', 'optionalString'], 'or(null or undefined, string)', 22)
  },

  {
    desc: 'arrayOf ✖️ : (string) 33',
    subject: 33,
    schema: arrayOf(string),
    expected: createError(undefined, 'array', 33)
  },

  {
    desc: 'arrayOf ✖️ : (string) [33]',
    subject: ['33', 44],
    schema: arrayOf(string),
    expected: createError([1], 'string', 44)
  },

  {
    desc: 'arrayOf ✔️ : elements all matching schema',
    subject: [{
      str: 'str1',
      num: 333,
      obj: {
        str: 'str1',
        num: 333
      }
    }],
    schema: arrayOf(objectOf({
      str: string,
      num: number,
      obj: objectOf({
        str: string,
        num: number,
      })
    })),
    expected: VALID
  },

  {
    desc: 'arrayOf ✖️ : some element not matching schema',
    subject: [
      { str: 'str1', num: 333, obj: { str: 'str1', num: 333 } },
      { str: 'str1', num: 333, obj: { str: 'str1', num: '333' } },
    ],
    schema: arrayOf(objectOf({
      str: string,
      num: number,
      obj: objectOf({
        str: string,
        num: number,
      })
    })),
    expected: createError([1, 'obj', 'num'], 'number', '333')
  },

  {
    desc: 'jsonString ✔️ : a json string matching custom validator',
    subject: '{ "str": "apple", "num": 42 }',
    schema: jsonString(objectOf({
      str: string,
      num: number
    })),
    expected: VALID
  },

  {
    desc: 'jsonString ✖️ : a json string mismatching custom validator',
    subject: '{ "str": "apple", "num": null }',
    schema: jsonString(objectOf({
      str: string,
      num: number
    })),
    expected: createError(['num'], 'number', null)
  },

  {
    desc: 'like ✔️ : subject matching reference',
    subject: [{
      str: 'str1',
      num: 444,
      obj: {
        str: 'str1',
        num: 444
      }
    }, {
      str: 'str1',
      num: 444,
      obj: {
        str: 'str1',
        num: 555
      }
    }],
    schema: like([{
      str: 'str1',
      num: 333,
      obj: {
        str: 'str1',
        num: 333
      }
    }]),
    expected: VALID
  },

  {
    desc: 'like ✖️ : subject not matching reference',
    subject: [{
      str: 'str1',
      num: 444,
      obj: {
        str: 'str1',
        num: 444
      }
    }, {
      str: 'str1',
      num: 444,
      obj: {
        str: 'str1',
        // num: empty!
      }
    }],
    schema: like([{
      str: 'str1',
      num: 333,
      obj: {
        str: 'str1',
        num: 333
      }
    }]),
    expected: createError([1, 'obj', 'num'], 'number', undefined)
  },


]


tests.forEach(({ desc, subject, schema, expected }) => {
  it(desc, () => {
    const result = schema(subject)
    expect(result).toEqual(expected)
  })
})
