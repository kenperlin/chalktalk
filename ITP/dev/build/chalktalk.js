;(function() {
var core, utility_Utils, objects_testObject, main, app;
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
utility_Utils = function () {
  var CT = core;
  CT.Utils = {
    extend: function (child, parent) {
      function TmpConst() {
      }
      TmpConst.prototype = parent.prototype;
      child.prototype = new TmpConst();
      child.prototype.constructor = child;
    },
    arraysEqual: function (a, b) {
      if (a === b)
        return true;
      if (a === null || b === null)
        return false;
      if (a.length != b.length)
        return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
          return false;
      }
      return true;
    }
  };
  return CT;
}();
objects_testObject = function () {
  var CT = core;
  /**
  	* Chalktalk basic object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.obj = function () {
    /**public variables go here under 'this'*/
    this.publicVar = Math.PI;
    //static variable
    if (CT.obj.count == undefined) {
      CT.obj.count = 1;
    } else {
      CT.obj.count++;
    }
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.obj.prototype = {
    objectCount: function () {
      console.log(CT.obj.count);
    },
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
}();
main = function (require) {
  
  // Load any app-specific modules
  // with a relative require call,
  // like:
  // 
  // var THREE = require('../deps/three');
  var CT = core;
  utility_Utils;
  // require('objects/CTObject');
  objects_testObject;
  // require('objects/testSubObject');
  // require('basicMath');
  console.log('hi');
  window.CT = CT;
  return CT;
}({});
requirejs.config({
  'baseUrl': '../../src',
  'paths': {
    'app': './src',
    'THREE': '../deps/three'
  },
  'shim': { 'THREE': { exports: 'THREE' } }
});
// Load the main app module to start the app
requirejs(['main']);
app = undefined;
}());