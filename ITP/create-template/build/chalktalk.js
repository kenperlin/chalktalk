;(function() {
var core, DLtest_01, objects_testObject, objects_testSubObject, basicMath, app;
core = function (require) {
  var CT = function () {
    this._version = 'v.001';
    this._hello = 'hello';
    this._whatisup = 'whatisup';
    this._isThing = 'thing';
  };
  return CT;
}({});
DLtest_01 = function (require) {
  
  var CT = core;
  CT.prototype.thing = function (b) {
    var a = b * b;
    document.write(a);
  };
  return CT;
}({});
objects_testObject = function (require) {
  var CT = core;
  CT.obj = function () {
    //public variables go here under 'this'
    this.publicVar = Math.PI;
  };
  CT.obj.prototype = {
    _privateVar: 36,
    constructor: CT.obj,
    get privateVar() {
      return this._privateVar;
    },
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
  // var CT = require('core');
  var CT = objects_testObject;
  CT.subObj = function () {
    CT.obj.call(this);
    // private variables can go here
    var _subVar = 36;
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
  CT.subObj.prototype.sayHi = function (s) {
    console.log(s);
  };
  return CT;
}();
basicMath = function () {
  var CT = core;
  CT.prototype.Math = {
    square: function (b) {
      var a = b * b;
      return a;
    },
    multiply: function (a, b) {
      return a * b;
    }
  };
  return CT.Math;
}();
app = function (require) {
  
  // Load any app-specific modules
  // with a relative require call,
  // like:
  // 
  var CT = core;
  DLtest_01;
  objects_testObject;
  objects_testSubObject;
  basicMath;
  window.CT = CT;
  return CT;
}({});
}());