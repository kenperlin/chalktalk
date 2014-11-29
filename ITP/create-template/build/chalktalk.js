;(function() {
var core, objects_testObject, objects_testSubObject, basicMath, app;
core = function (require) {
  /**
  * Chalktalk is a gesture based communication tool
  * @author Ken Perlin
  * @version  .001
  * @class _Chalktalk
  */
  var CT = { version: 'v.001' };
  return CT;
}({});
objects_testObject = function (require) {
  var CT = core;
  /**
  	* Chalktalk basic object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.obj = function () {
    /**public variables go here under 'this'*/
    this.publicVar = Math.PI;
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.obj.prototype = {
    //I don't think this is required, not sure
    // constructor: CT.obj, 
    /** a test private variable*/
    _privateVar: 36,
    /**returns the private variable*/
    get privateVar() {
      return this._privateVar;
    },
    /**
    * sets a private variable to a number
    * @type {number} a set a number
    */
    set privateVar(a) {
      if (typeof a == 'number')
        this._privateVar = a;
      else
        console.log('NaN');
    }
  };
  return CT;
}({});
objects_testSubObject = function () {
  var CT = objects_testObject;
  /**
  *  @class a CT sub object
  *
  *	@constructor
  *	@extends {CT}
  *	@param {number=} [num=36] private variable value
  */
  CT.subObj = function (num) {
    CT.obj.call(this);
    // private variables can go here
    var _subVar = num || 36;
    // set getters and setters here
    Object.defineProperty(this, 'sub', {
      get: function () {
        return _subVar;
      },
      set: function (y) {
        if (y > 12)
          _subVar = y;
      }
    });
  };
  CT.subObj.prototype = Object.create(CT.obj.prototype);
  /**
  * logs input
  * @param  {string=} s any string
  * @param  {array=}  arr array of strings		 * 
  */
  CT.subObj.prototype.sayHi = function (s) {
    if (s && typeof s == 'string')
      console.log(s);
    else if (s && Object.prototype.toString.call(s) === '[object Array]') {
      for (var i = 0; i < s.length; i++) {
        console.log(s[i]);
      }
    } else
      console.log(this);
  };
  return CT;
}();
basicMath = function () {
  var CT = core;
  CT.Math = {
    square: function (b) {
      var a = b * b;
      return a;
    },
    multiply: function (a, b) {
      return a * b;
    }
  };
  return CT;
}();
app = function (require) {
  
  // Load any app-specific modules
  // with a relative require call,
  // like:
  // 
  var CT = core;
  objects_testObject;
  objects_testSubObject;
  basicMath;
  window.CT = CT;
  return CT;
}({});
}());