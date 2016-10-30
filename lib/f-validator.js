'use strict';

/**
 * Utils:
 */

//  error constructor
var error = function (path, expected, received, message) {
    if ( path === void 0 ) path = [];

    return ({
    path: path,
    expected: expected,
    received: received,
    message: message || ("Path:'" + (path.join('.')) + "', Expected: " + expected + ", Received: '" + (JSON.stringify(received)) + "'")
  });
};

// get primitive type
var type = function (val) {
  if (val !== val) {
    return 'NaN'
  }
  var typeMatch = Object.prototype.toString.call(val).match(/^\[object (\w+)\]$/);
  return typeMatch == null ? 'unknown' : typeMatch[1].toLowerCase()
};

// dedupe an array
var dedupe = function (arr) { return arr.filter(function (val, i) { return arr.indexOf(val) === i; }); };

var deepEqual = function (a, b) { return (
  (a === b) ||
  JSON.stringify(a) === JSON.stringify(b) ||
  (
    typeof a === 'object' &&
    typeof b === 'object' &&
    dedupe(Object.keys(a).concat( Object.keys(b)))
    .every(function (key) { return deepEqual(a[key], b[key]); })
  )
); };

var nullOrUndefined = function (s, path) { return s == null ? null : error(path, 'null or undefined', s); };


/**
 * Logical Operators
 */
var not = function (v) { return function (s, path) { return v(s) ? null : error(path, ("not(" + (v.name) + ")"), s); }; };

var any =
  function (s, path) { return null; };

var and = function () {
    var vs = [], len = arguments.length;
    while ( len-- ) vs[ len ] = arguments[ len ];

    return function (s, path) {
    for (var i = 0, list = vs; i < list.length; i += 1) {
      var v = list[i];

      var err = v(s, path);
      if (err) { return err }
    }
    return null
  };
};

var or = function () {
    var vs = [], len = arguments.length;
    while ( len-- ) vs[ len ] = arguments[ len ];

    return function (s, path) {
    var errs = [];
    for (var i = 0, list = vs; i < list.length; i += 1) {
      var v = list[i];

      var err = v(s, path);
      if (!err) {
        return null
      } else {
        errs.push(err);
      }
    }
    return error(path, ("or(" + (errs.map(function (e) { return e.expected; }).join(', ')) + ")"), s)
  };
};

var optional = function (v) { return or(nullOrUndefined, v); };


// strictly/deeply equal
var is = function (value) { return function (s, path) { return deepEqual(s, value) ? null : error(path, ("is(" + (JSON.stringify(value)) + ")"), s); }; };

var oneOf = function () {
    var refs = [], len = arguments.length;
    while ( len-- ) refs[ len ] = arguments[ len ];

    return or.apply(void 0, refs.map(function (ref) { return is(ref); }));
};



/**
 * Basic Type Validators
 */
var string = function (s, path) { return type(s) === 'string' ? null : error(path, 'string', s); };
var number = function (s, path) { return type(s) === 'number' ? null : error(path, 'number', s); };
var boolean = function (s, path) { return type(s) === 'boolean' ? null : error(path, 'boolean', s); };
var object = function (s, path) { return type(s) === 'object' ? null : error(path, 'object', s); };
var array = function (s, path) { return type(s) === 'array' ? null : error(path, 'array', s); };
var date = function (s, path) { return type(s) === 'date' ? null : error(path, 'date', s); };
var regexp = function (s, path) { return type(s) === 'regexp' ? null : error(path, 'regexp', s); };
var Null = function (s, path) { return type(s) === 'null' ? null : error(path, 'null', s); };
var Undefined = function (s, path) { return type(s) === 'undefined' ? null : error(path, 'undefined', s); };
var empty = nullOrUndefined;


/**
 * Composite Type Validators
 */
var objectOf = function (objSchema) { return and.apply(
    void 0, [ object ].concat( Object.keys(objSchema).map(function (key) { return (function (s, path) {
        if ( path === void 0 ) path = [];

        return objSchema[key](s[key], path.concat(key));
        }); }
    ) )
  ); };

var arrayOf = function (v) { return function (ss, path) {
    if ( path === void 0 ) path = [];

    var err = (array(ss, path));
    if (err) { return err }
    for (var i = 0; i < ss.length; i++) {
      err = v(ss[i], path.concat(i));
      if (err) { return err }
    }
    return null
  }; };

var toObjSchema = function (ref) {
  switch (type(ref)) {
    case 'function':
      return ref // I'm a special flake
    case 'number':
      return number
    case 'string':
      return string
    case 'boolean':
      return boolean
    case 'date':
      return date
    case 'regexp':
      return regexp
    case 'null':
      return empty
    case 'undefined':
      return empty
    case 'object':
      return objectOf(
        Object.keys(ref).reduce(function (schema, key) {
          schema[key] = toObjSchema(ref[key]);
          return schema
        }, {})
      )
    case 'array':
      return ref[0] == null ? array : arrayOf(toObjSchema(ref[0]))
    default:
      return is(ref)
  }
};
var like = toObjSchema;

/**
 * Other Commonly Used Validators
 */
var regex = function (re) { return function (s, path) { return re.test(s) ? null : error(path, ("match regex(" + re + ")"), s); }; };


module.exports = {
  error: error,

  object: object,
  array: array,
  string: string,
  number: number,
  boolean: boolean,
  date: date,
  regexp: regexp,
  Null: Null,
  Undefined: Undefined,
  empty: empty,
  regex: regex,

  not: not,
  any: any,
  and: and,
  or: or,
  optional: optional,
  is: is,
  oneOf: oneOf,
  like: like,

  objectOf: objectOf,
  arrayOf: arrayOf
};
