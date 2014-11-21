define(function (require) {

  var CT = require('core');

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
      if (typeof a == "number")
        this._privateVar = a;
      else
        console.log('NaN');
    }

  };

  return CT;

});