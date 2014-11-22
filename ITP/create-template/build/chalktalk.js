;(function() {
var core, DLtest_01, objects_testObject, objects_testSubObject, basicMath, math_M4js, math_mathjs, app;
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
math_M4js = function (require) {
  
  var CT = core;
  CT.M4 = function () {
    this._mS = [];
    this._to = 0;
    this._mS[0] = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
  };
  CT.M4.prototype = {
    constructor: CT.M4,
    _m: function (arg) {
      if (!(arg === undefined))
        this._mS[this._to] = arg;
      return this._mS[this._to];
    },
    aimX: function (mat) {
      var A = this._m();
      var B = mat._m();
      var X = [
        B[12] - A[12],
        B[13] - A[13],
        B[14] - A[14]
      ];
      var Z = [
        A[8],
        A[9],
        A[10]
      ];
      var Y = cross(Z, X);
      cross(X, Y, Z);
      return this.setOrientation(X, Y, Z);
    },
    aimY: function (mat) {
      var A = this._m();
      var B = mat._m();
      var Y = [
        B[12] - A[12],
        B[13] - A[13],
        B[14] - A[14]
      ];
      var X = [
        A[0],
        A[1],
        A[2]
      ];
      var Z = cross(X, Y);
      cross(Y, Z, X);
      return this.setOrientation(X, Y, Z);
    },
    aimZ: function (mat) {
      var A = this._m();
      var B = mat._m();
      var Z = [
        B[12] - A[12],
        B[13] - A[13],
        B[14] - A[14]
      ];
      var Y = [
        A[4],
        A[5],
        A[6]
      ];
      var X = cross(Y, Z);
      cross(Z, X, Y);
      return this.setOrientation(X, Y, Z);
    },
    copy: function (m) {
      for (var i = 0; i < 16; i++)
        this._m()[i] = m._m()[i];
      return this;
    },
    identity: function () {
      this._m(this._id());
      return this;
    },
    normalMatrix: function (m) {
      var a = m[0] * m[0] + m[1] * m[1] + m[2] * m[2], b = m[4] * m[4] + m[5] * m[5] + m[6] * m[6], c = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];
      return [
        m[0] / a,
        m[1] / a,
        m[2] / a,
        0,
        m[4] / b,
        m[5] / b,
        m[6] / b,
        0,
        m[8] / c,
        m[9] / c,
        m[10] / c,
        0,
        0,
        0,
        0,
        1
      ];
    },
    normalize: function (v) {
      var x = v[0], y = v[1], z = v[2], r = Math.sqrt(x * x + y * y + z * z);
      v[0] /= r;
      v[1] /= r;
      v[2] /= r;
    },
    perspective: function (x, y, z) {
      this._xf(this._pe(x, y, z));
      return this;
    },
    restore: function () {
      --this._to;
    },
    rotateX: function (a) {
      this._xf(this._rX(a));
      return this;
    },
    rotateY: function (a) {
      this._xf(this._rY(a));
      return this;
    },
    rotateZ: function (a) {
      this._xf(this._rZ(a));
      return this;
    },
    save: function () {
      this._mS[this._to + 1] = this._mS[this._to++];
    },
    scale: function (x, y, z) {
      if (y === undefined)
        z = y = x;
      this._xf(this._sc(x, y, z));
      return this;
    },
    setOrientation: function (X, Y, Z) {
      this.normalize(X);
      this.normalize(Y);
      this.normalize(Z);
      var v = this._m();
      v[0] = X[0];
      v[1] = X[1];
      v[2] = X[2];
      v[4] = Y[0];
      v[5] = Y[1];
      v[6] = Y[2];
      v[8] = Z[0];
      v[9] = Z[1];
      v[10] = Z[2];
      return this;
    },
    toString: function () {
      var str = '';
      for (var i = 0; i < 16; i++)
        str += (i == 0 ? '[' : ',') + roundedString(this._m()[i]);
      return str + ']';
    },
    translate: function (x, y, z) {
      this._xf(this._tr(x, y, z));
      return this;
    },
    transpose: function (m) {
      return [
        m[0],
        m[4],
        m[8],
        m[12],
        m[1],
        m[5],
        m[9],
        m[13],
        m[2],
        m[6],
        m[10],
        m[14],
        m[3],
        m[7],
        m[11],
        m[15]
      ];
    },
    _xf: function (m) {
      return this._m(this._mm(m, this._m()));
    },
    _id: function () {
      return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ];
    },
    _tr: function (x, y, z) {
      return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        x,
        y,
        z,
        1
      ];
    },
    _rX: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [
        1,
        0,
        0,
        0,
        0,
        c,
        s,
        0,
        0,
        -s,
        c,
        0,
        0,
        0,
        0,
        1
      ];
    },
    _rY: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [
        c,
        0,
        -s,
        0,
        0,
        1,
        0,
        0,
        s,
        0,
        c,
        0,
        0,
        0,
        0,
        1
      ];
    },
    _rZ: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [
        c,
        s,
        0,
        0,
        -s,
        c,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ];
    },
    _sc: function (x, y, z) {
      return [
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1
      ];
    },
    _pe: function (x, y, z) {
      var rr = x * x + y * y + z * z;
      return [
        1,
        0,
        0,
        x / rr,
        0,
        1,
        0,
        y / rr,
        0,
        0,
        1,
        z / rr,
        0,
        0,
        0,
        1
      ];
    },
    _d: function (a, b) {
      return a[0] * b[0] + a[1] * b[1] + (b.length < 3 ? 0 : a[2] * b[2]) + (b.length < 4 ? a[3] : a[3] * b[3]);
    },
    _x: function (m) {
      return [
        m[0],
        m[1],
        m[2],
        m[3]
      ];
    },
    _y: function (m) {
      return [
        m[4],
        m[5],
        m[6],
        m[7]
      ];
    },
    _z: function (m) {
      return [
        m[8],
        m[9],
        m[10],
        m[11]
      ];
    },
    _w: function (m) {
      return [
        m[12],
        m[13],
        m[14],
        m[15]
      ];
    },
    _mm: function (a, b) {
      var t = this.transpose(b);
      var x = this._x(a), y = this._y(a), z = this._z(a), w = this._w(a);
      var X = this._x(t), Y = this._y(t), Z = this._z(t), W = this._w(t);
      return [
        this._d(x, X),
        this._d(x, Y),
        this._d(x, Z),
        this._d(x, W),
        this._d(y, X),
        this._d(y, Y),
        this._d(y, Z),
        this._d(y, W),
        this._d(z, X),
        this._d(z, Y),
        this._d(z, Z),
        this._d(z, W),
        this._d(w, X),
        this._d(w, Y),
        this._d(w, Z),
        this._d(w, W)
      ];
    },
    _mv: function (m, v) {
      var M = this._m();
      var x = this._d([
        M[0],
        M[4],
        M[8],
        M[12]
      ], v);
      var y = this._d([
        M[1],
        M[5],
        M[9],
        M[13]
      ], v);
      var z = this._d([
        M[2],
        M[6],
        M[10],
        M[14]
      ], v);
      var w = this._d([
        M[3],
        M[7],
        M[11],
        M[15]
      ], v);
      return v.length == 4 ? [
        x,
        y,
        z,
        w
      ] : [
        x / w,
        y / w,
        z / w
      ];
    },
    transform: function (v) {
      if (v[0] instanceof Array) {
        var dst = [];
        for (var n = 0; n < v.length; n++)
          dst.push(this.transform(v[n]));
        return dst;
      } else
        return this._mv(this._m(), v);
    }
  };
  return CT.M4;
}({});
math_mathjs = function (require) {
  
  //var M4 = require('M4');
  var CT = core;
  CT.Math = function () {
  };
  CT.Math.prototype = {
    constructor: CT.Math,
    cross: function (a, b, c) {
      if (c === undefined)
        c = [
          0,
          0,
          0
        ];
      c[0] = a[1] * b[2] - a[2] * b[1];
      c[1] = a[2] * b[0] - a[0] * b[2];
      c[2] = a[0] * b[1] - a[1] * b[0];
      return c;
    },
    just_print: function () {
      console.log('I am in Math');
    }
  };
}({});
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
  math_M4js;
  math_mathjs;
  window.CT = CT;
  return CT;
}({});
}());