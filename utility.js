
/////////////// UTILITY FUNCTIONS ///////////////////

// CHECKING FOR SYNTAX ERRORS IN JAVASCRIPT CODE.

   function findSyntaxError( code ) {
      var error = [];
      var save_onerror = onerror;
      onerror = function(errorMsg, url, lineNumber) {
         error = [lineNumber, errorMsg.replace("Uncaught ","")];
      }
      var element = document.createElement('script');
      element.appendChild(document.createTextNode( code ));
      document.body.appendChild(element);
      onerror = save_onerror;
      return error;
   }


// GET AND SET STATE DATA VIA THE PERSISTENT SERVER.

   function Server() {
      this.name = name;

      this.set = function(key, val) {
         var setForm = new FormData();
         setForm.append("key", key + ".json");
         setForm.append("value", JSON.stringify(val));

         var request = new XMLHttpRequest();
         request.open("POST", "set");
         request.send(setForm);
      }

      this.get = function(key, fn) {
         var getRequest = new XMLHttpRequest();
         getRequest.open("GET", key + ".json");
         getRequest.onloadend = function() {
            fn(getRequest.responseText);
         }
         getRequest.send();
      }
   }

   var server = new Server();


// TYPES AND FORMAT CONVERSIONS.

   function hexChar(n) {
      return String.fromCharCode((n < 10 ? 48 : 87) + n);
   }
   function hex(n) {
      return hexChar(n >> 4) + hexChar(n & 15);
   }
   function def(v, d) { return v !== undefined ? v : d !== undefined ? d : 0; }
   function isDef(v) { return ! (v === undefined); }
   function isNumeric(v) { return ! isNaN(v); }
   function roundedString(v, nDigits) {
      var nd = nDigits === undefined ? 2 : nDigits;
      if (typeof(v) == 'string')
         v = parseFloat(v);
      var p = nd<=0 ? 1 : nd==1 ? 10 : nd==2 ? 100 : 1000;
      var str = "" + (floor(p * abs(v) + 0.5) / p);

      if (nDigits !== undefined && nd > 0) {
         var i = str.indexOf(".");
	 if (i < 0) {
	    str += ".";
	    i = str.length - 1;
         }
         while (str.length - i < nd + 1)
	    str += "0";
      }

      return (v < 0 ? "-" : "") + str;
   }


// HANDLE PLAYING AN AUDIO SIGNAL:

   var audioNode = null, audioIndex = 0;

   var signalBuffer = newArray(1024);

   var setAudioSignal = function(f) {
      if (audioNode == null) {
         audioContext = 'AudioContext' in window ? new AudioContext() :
                        'webkitAudioContext' in window ? new webkitAudioContext() : null;
         if (audioContext != null) {
            audioNode = audioContext.createScriptProcessor(1024, 0, 1);
            audioNode.connect(audioContext.destination);
         }
      }
      if (audioNode != null) {
         audioNode.onaudioprocess = function(event) {
            var output = event.outputBuffer;
            var signal = output.getChannelData(0);
            if (f instanceof Array)
               for (var i = 0 ; i < output.length ; i++)
                  signal[i] = f[audioIndex++ % f.length];
            else
               for (var i = 0 ; i < output.length ; i++)
                  signal[i] = f(audioIndex++ / output.sampleRate);
         }
      }
   }


// SET OPERATIONS:

   function Set() {
      this.debug = false;
      this.add = function(item) {
         if (! this.contains(item))
            this.push(item);
      }

      this.remove = function(item) {
         var index = this.indexOf(item);
         if (index >= 0)
            this.splice(index, 1);
      }

      this.contains = function(item) {
         return this.indexOf(item) >= 0;
      }

      this.indexOf = function(item) {
         for (var i = 0 ; i < this.length ; i++)
            if (equals(item, this[i]))
               return i;
         return -1;
      }

      function equals(a, b) {
         if (a instanceof Array) {
            for (var i = 0 ; i < a.length ; i++)
               if (! equals(a[i], b[i]))
                  return false;
            return true;
         }
         return a == b;
      }

      this.toString = function() {
         var str = "[";
         for (var i = 0 ; i < this.length ; i++)
            str += this[i] + (i<this.length-1 ? "," : "]");
         return str;
      }
   }
   Set.prototype = new Array;


// CHOICE SELECTION WITH CONTINUOUS TRANSITION WEIGHTS.

   function Choice() {
      this.flip = function() {
         this.set(1 - this.stateValue);
      }
      this.value = function(i) {
         if (i === undefined) i = 0;
         return sCurve(this.weights[i]);
      }
      this.state = function(n) {
         if (n !== undefined) {
            this.stateValue = n;
            this.update();
         }
         return this.stateValue;
      }
      this.update = function(delta) {
         if (delta === undefined)
            delta = 0;

         while (this.weights.length <= this.stateValue)
            this.weights.push(0);

         for (var i = 0 ; i < this.weights.length ; i++)
            this.weights[i] =
               i == this.stateValue ? min(1, this.weights[i] + 2 * delta)
                                    : max(0, this.weights[i] - delta);
      }
      this.weights = [];
      this.state(0);
   }


// ENCODE A FRACTIONAL AMOUNT AS A PRINTABLE CHARACTER (HAS ABOUT 2 SIG. DIGITS PRECISION).

   function EncodedFraction() {
      this.chars = "";
      for (i = 32 ; i < 127 ; i++) {
         var ch = String.fromCharCode(i);
         switch (ch) {
         case '\\':
         case '"':
            break;
         default:
            this.chars += ch;
            break;
         }
      }
      this.encode = function(t) {
         t = max(0, min(1, t));
         var i = floor((this.chars.length - 1) * t + 0.5);
         return this.chars.substring(i, i+1);
      }

      this.decode = function(ch) {
         return this.chars.indexOf(ch) / (this.chars.length - 1);
      }
   }


// CONVERT A FRACTIONAL VALUE BETWEEN 0.0 AND 1.0 TO HEAT MAP RGB.

   function fractionToRGB(fraction, rgb) {
      var t = 5 * fraction;
      switch (floor(t)) {
      case 0 : return [ 0     , 0     , t     ];
      case 1 : return [ 0     , t - 1 , 1     ];
      case 2 : return [ 0     , 1     , 3 - t ];
      case 3 : return [ t - 3 , 1     , 0     ];
      default: return [ 1     , 5 - t , 0     ];
      }
   }


// PHYSICS.

   // Physics objects must inherit from "Clonable" for cloning to work properly.

   function Clonable() { }

   function Spring() {
      this.P = 0;
      this.V = 0;
      this.F = 0;
      this.mass = 1.0;
      this.damping = 1.0;

      this.getPosition = function()  { return this.P; }
      this.setDamping  = function(t) { this.damping = t; }
      this.setForce    = function(t) { this.F = t; }
      this.setMass     = function(t) { this.mass = Math.max(0.001, t); }

      this.update      = function(elapsed) {
         this.V += (this.F - this.P) / this.mass * elapsed;
         this.P  = (this.P + this.V) * (1 - this.damping * elapsed);
      }
   }
   Spring.prototype = new Clonable;


// MATH CONSTANTS AND FUNCTIONS

   var PI = Math.PI;
   var TAU = 2 * PI;

   function abs(a) { return Math.abs(a); }
   function acos(a) { return Math.acos(a); }
   function asin(a) { return Math.asin(a); }
   function atan(a) { return Math.atan(a); }
   function atan2(a, b) { return Math.atan2(a, b); }
   function ceil(t) { return Math.ceil(t); }
   function cos(t) { return Math.cos(t); }
   function cotan(t) { return Math.cotan(t); }
   function distance(a, b) {
      var dd = 0;
      for (var i = min(a.length, b.length) - 1 ; i >= 0 ; i--)
         dd += (a[i] - b[i]) * (a[i] - b[i]);
      return sqrt(dd);
   }
   function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
   function dot4(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]; }
   function exp(t) { return Math.exp(t); }
   function floor(t) { return Math.floor(t); }
   function ik(a, b, C, D) {
      var cc = dot(C,C), x = (1 + (a*a - b*b)/cc) / 2, y = dot(C,D)/cc;
      for (var i = 0 ; i < 3 ; i++) D[i] -= y * C[i];
      y = sqrt(max(0,a*a - cc*x*x) / dot(D,D));
      for (var i = 0 ; i < 3 ; i++) D[i] = x * C[i] + y * D[i];
   }
   function irandom(n) { return floor(n * random()); }
   function isEqualArray(a, b) {
      if (a === undefined || b === undefined ||
          a == null || b == null || a.length != b.length)
         return false;
      for (var i = 0 ; i < a.length ; i++)
         if (a[i] != b[i])
            return false;
      return true;
   }
   function len(x, y, z) {
      if (z !== undefined)
         return sqrt(x * x + y * y + z * z);
      if (y !== undefined)
         return sqrt(x * x + y * y);
      if (x.length == 3)
         return sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
      else
         return sqrt(x[0] * x[0] + x[1] * x[1]);
   }
   function lerp(t,a,b) { return a + t * (b - a); }
   function log(a, b) { return Math.log(a, b); }
   function max(a,b,c) { return c===undefined ? Math.max(a,b) : Math.max(a,Math.max(b,c)); }
   function min(a,b,c) { return c===undefined ? Math.min(a,b) : Math.min(a,Math.min(b,c)); }
   function mix(a, b, t) {
      if (! Array.isArray(a))
         return a + (b - a) * t;

      var dst = [];
      for (var i = 0 ; i < a.length ; i++)
         dst.push(a[i] + (b[i] - a[i]) * t);
      return dst;
   }

   var noise2P = [], noise2U = [], noise2V = [];
   function fractal(x) {
      var value = 0;
      for (var f = 1 ; f <= 512 ; f *= 2)
         value += noise2(x * f, 0.03 * x * f) / f;
      return value;
   }
   function turbulence(x) {
      var value = 0;
      for (var f = 1 ; f <= 512 ; f *= 2)
         value += abs(noise2(x * f, 0.03 * x * f) / f);
      return value;
   }
   function noise(x) { return noise2(x, 0.03 * x); }
   function noise2(x, y) {
      if (noise2P.length == 0) {
         var p = noise2P, u = noise2U, v = noise2V, i, j;
         for (i = 0 ; i < 256 ; i++) {
            p[i] = i;
            u[i] = 2 * random() - 1;
            v[i] = 2 * random() - 1;
            var s = sqrt(u[i]*u[i] + v[i]*v[i]);
            u[i] /= s;
            v[i] /= s;
         }
         while (--i) {
            var k = p[i];
            p[i] = p[j = floor(256 * random())];
            p[j] = k;
         }
         for (i = 0 ; i < 256 + 2 ; i++) {
            p[256 + i] = p[i];
            u[256 + i] = u[i];
            v[256 + i] = v[i];
         }
      }
      var P = noise2P, U = noise2U, V = noise2V;
      x = (x + 4096) % 256;
      y = (y + 4096) % 256;
      var i = floor(x), u = x - i, s = sCurve(u);
      var j = floor(y), v = y - j, t = sCurve(v);
      var a = P[P[i] + j  ], b = P[P[i+1] + j  ];
      var c = P[P[i] + j+1], d = P[P[i+1] + j+1];
      return mix(mix(u*U[a] +  v   *V[a], (u-1)*U[b] +  v   *V[b], s),
                 mix(u*U[c] + (v-1)*V[c], (u-1)*U[d] + (v-1)*V[d], s), t);
   }
   function pieMenuIndex(x,y,n) {
      if (n === undefined)
         n = 4;
      return floor(n+.5-atan2(y,x) / (TAU/n)) % n;
   }
   function pow(a,b) { return Math.pow(a,b); }
   var random = function() {
      var seed = 2;
      var x = (seed % 30268) + 1;
      seed  = (seed - (seed % 30268)) / 30268;
      var y = (seed % 30306) + 1;
      seed  = (seed - (seed % 30306)) / 30306;
      var z = (seed % 30322) + 1;
      return function() {
         return ( ((x = (171 * x) % 30269) / 30269) +
                  ((y = (172 * y) % 30307) / 30307) +
                  ((z = (170 * z) % 30323) / 30323) ) % 1;
      }
   }();
   function round() { return Math.round(); }
   function sCurve(t) { return max(0, min(1, t * t * (3 - t - t))); }
   function saw(t) { t = 2*t % 2; return t<1 ? t : 2-t; }
   function sign(t) { return Math.sign(t); }
   function sin(t) { return Math.sin(t); }
   function solve(A) { /* From http://martin-thoma.com */
      // Solve a system of linear equations given as an n x n+1 matrix.
      var n = A.length;
      for (var i=0; i<n; i++) {
         // Search for maximum in this column.
         var maxRow = i, maxEl = Math.abs(A[i][i]);
         for (var k=i+1; k<n; k++)
            if (Math.abs(A[k][i]) > maxEl) {
               maxEl = Math.abs(A[k][i]);
               maxRow = k;
            }
         // Swap maximum row with current row (column by column).
         for (var k=i; k<n+1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
         }
         // Make all rows below this one 0 in current column.
         for (k=i+1; k<n; k++) {
            var c = -A[k][i] / A[i][i];
            for(var j=i; j<n+1; j++)
               A[k][j] = i==j ? 0 : A[k][j] + c * A[i][j];
         }
      }
      // Solve equation Ax=b for an upper triangular matrix A.
      var x = new Array(n);
      for (var i=n-1; i>-1; i--) {
         x[i] = A[i][n] / A[i][i];
         for (var k=i-1; k>-1; k--)
            A[k][n] -= A[k][i] * x[i];
      }
      return x; // Return n x 1 result vector.
   }
   function square_wave(t) { return 2 * floor(2*t % 2) - 1; }
   function sqrt(t) { return Math.sqrt(t); }
   function tan(t) { return Math.tan(t); }
   function valueOf(src, u, v) {
      if (typeof src !== 'function')
         return src;
      else if (v === undefined)
         return src(u);
      else
         return src(u, v);
   }
   function valuesToQuadratic(src, dst) {
      if (dst === undefined)
         dst = [0,0,0];
      dst[0] = (src[0] + src[2]) / 2 - src[1];
      dst[1] = (src[2] - src[0]) / 2;
      dst[2] =  src[1];
      return dst;
   }

// USEFUL PRE-BUILT CURVES.

   var curveForSignal = makeSpline([[-.6,-.1],[-.4,.1],[-.2,-.1],[0,.1]]);

// CHARACTER CONSTANTS AND CONVERSIONS.

   var ALT       = '\u22C0' ;
   var C_PHI     = '\u03A6' ;
   var C_THETA   = '\u0398' ;
   var COMMAND   = '\u2318' ;
   var CONTROL   = '\u2201' ;
   var D_ARROW   = '\u2193' ;
   var EXP_2     = '\u00b2' ;
   var EXP_3     = '\u00b3' ;
   var EXP_4     = '\u2074' ;
   var G_OR_EQ   = '\u2265' ;
   var L_ARROW   = '\u2190' ;
   var L_OR_EQ   = '\u2264' ;
   var PAGE_UP   = 'PAGE_UP';
   var PAGE_DN   = 'PAGE_DN';
   var R_ARROW   = '\u2192' ;
   var S_ALPHA   = '\u03b1' ;
   var S_BETA    = '\u03b2' ;
   var S_DELTA   = '\u03b4' ;
   var S_EPSILON = '\u03b5' ;
   var S_PI      = '\u03c0' ;
   var S_PHI     = '\u03C6' ;
   var S_THETA   = '\u03B8' ;
   var U_ARROW   = '\u2191' ;

   function charCodeToString(key) {
      if (isControlPressed) {
         switch (key) {
	 case 50: return EXP_2;   // SUPERSCRIPT 2
	 case 51: return EXP_3;   // SUPERSCRIPT 3
	 case 52: return EXP_4;   // SUPERSCRIPT 4
	 case 65: return S_ALPHA;
	 case 66: return S_BETA;
	 case 68: return S_DELTA;
	 case 69: return S_EPSILON;
	 case 70: return S_PHI;
	 case 71: return G_OR_EQ;
	 case 76: return L_OR_EQ;
	 case 80: return S_PI;
	 case 84: return S_THETA;
	 }
      }
      if (isShiftPressed)
         switch (key) {
         case 48: return ')'; // SHIFT 1
         case 49: return '!';
         case 50: return '@';
         case 51: return '#';
         case 52: return '$';
         case 53: return '%';
         case 54: return '^';
         case 55: return '&';
         case 56: return '*';
         case 57: return '('; // SHIFT 0

         case 186: return ':';
         case 187: return '+';
         case 188: return '<';
         case 189: return '_';
         case 190: return '>';
         case 191: return '?';
         case 192: return '~';
         case 219: return '{';
         case 220: return '|';
         case 221: return '}';
         case 222: return '"';
         }

      switch (key) {
      case   8: return 'del';
      case  13: return 'ret';
      case  16: return 'cap';
      case  17: return 'control';
      case  18: return 'alt';
      case  27: return 'esc';
      case  32: return 'spc';
      case  32: return 'spc';
      case  33: return PAGE_UP;
      case  34: return PAGE_DN;
      case  37: return L_ARROW;
      case  38: return U_ARROW;
      case  39: return R_ARROW;
      case  40: return D_ARROW;
      case  91: return 'command';
      case 186: return ';';
      case 187: return '=';
      case 188: return ',';
      case 189: return '-';
      case 190: return '.';
      case 191: return '/';
      case 192: return '`';
      case 219: return '[';
      case 220: return '\\';
      case 221: return ']';
      case 222: return "'";
      }

      var str = String.fromCharCode(key);

      if (key >= 64 && key < 64 + 32 && ! isShiftPressed)
         str = str.toLowerCase();

      return str;
   }


// STRING UTILITIES.

   function toString(obj) {
      var str = "{";
      for (var prop in obj) {
         str += prop + ":" + obj[prop] + ",";
      }
      return str + "}";
   }

   function variableToValue(str, name, value) {

      var cp = '.'.charCodeAt(0);
      var c_ = '_'.charCodeAt(0);
      var c0 = '0'.charCodeAt(0);
      var c9 = '9'.charCodeAt(0);
      var ca = 'a'.charCodeAt(0);
      var cz = 'z'.charCodeAt(0);
      var cA = 'A'.charCodeAt(0);
      var cZ = 'Z'.charCodeAt(0);

      for (var i = 0 ; i < str.length - name.length ; i++) {

         // FIND AN OCCURANCE OF name IN THE STRING.

         if (str.substring(i, i + name.length) == name) {

            // NO MATCH IF name IS PRECEDED BY . or _ or 0-9 or a-z or A-Z.

            if (i > 0) {
               var n = str.charCodeAt(i-1);
               if (n == cp || n == c_ || n >= c0 && n <= c9 || n >= ca && n <= cz || n >= cA && n <= cZ)
                  continue;
            }

            // NO MATCH IF name IS FOLLOWED BY _ or 0-9 or a-z or A-Z.

            if (i + name.length < str.length) {
               var n = str.charCodeAt(i-1);
               if (n == c_ || n >= c0 && n <= c9 || n >= ca && n <= cz || n >= cA && n <= cZ)
                  continue;
            }

            // OTHERWISE, DO THE SUBSTITUTION, AND ADJUST i ACCORDINGLY.

            str = str.substring(0, i) + value + str.substring(i + name.length, str.length);
            i += value.length - name.length;
         }
      }

      return str;
   }


// ARRAY UTILITIES.

   function arrayToString(a, level) {
      if (a.length == 0)
        return "[]";
      if (level === undefined)
        level = 0;
      var spacer = level == 0 ? " " : "";
      var str = "[" + spacer;
      for (var i = 0 ; i < a.length ; i++)
         str += (a[i] instanceof Array ? arrayToString(a[i], level+1) : a[i])
              + spacer + (i < a.length-1 ? "," + spacer : "]");
      return str;
   }

   function cloneArray(src) {
      var dst = [];
      for (var i = 0 ; i < src.length ; i++)
         if (src[i] instanceof Array)
            dst[i] = cloneArray(src[i]);
         else
            dst[i] = src[i];
      return dst;
   }

   function compressData(src) {
      var dst = [];
      for (i = 0 ; i < src.length ; i++)
         if (src[i] > 0)
            dst.push(src[i]);
         else {
            if (dst.length == 0 || dst[dst.length-1] > 0)
               dst.push(0);
            dst[dst.length-1]--;
         }
      return dst;
   }

   function copyArray(src, dst) {
      for (var i = 0 ; i < src.length ; i++)
         dst[i] = src[i];
   }

   function firstUndefinedArrayIndex(arr) {
      var n = 0;
      while (n < arr.length && isDef(arr[n]) && arr[n] != null)
         n++;
      return n;
   }

   function getIndex(arr, obj) {
      var i = arr.length;
      while (--i >= 0 && arr[i] !== obj) ;
      return i;
   }

   function newArray(n, k) {
      k = k === undefined ? 1 : k;
      var dst = [];
      for (var i = 0 ; i < n ; i++)
         switch (k) {
         case 1: dst.push(0); break;
         case 2: dst.push([0,0]); break;
         case 3: dst.push([0,0,0]); break;
         case 4: dst.push([0,0,0,1]); break;
	 }
      return dst;
   }

   function reverse(arr) {
      var dst = [];
      for (var i = arr.length - 1 ; i >= 0 ; i--)
         dst.push(arr[i]);
      return dst;
   }

   function sample(arr, t) {
      t = max(0, min(0.999, t));
      var n = arr.length;
      if (n == 1)
         return arr[0];
      var i = floor((n-1) * t);
      var f = (n-1) * t - i;
      return mix(arr[i], arr[i+1], f);
   }

   function uncompressData(src, len) {
      var dst = [];
      for (i = 0 ; i < src.length ; i++)
         if (src[i] > 0)
            dst.push(src[i]);
         else
            for (var n = 0 ; n < -src[i] ; n++)
               dst.push(0);
      if (len !== undefined)
         while (dst.length < len)
            dst.push(0);
      return dst;
   }

// IMAGE PROCESSING.

   function findConnectedComponents(src, nc, dst, f0) {
      function findConnectedComponent(i, n) {
         if (src[i] < f0)
	    return;

         dst[i] = n;
         var c = i % nc;
         var r = i / nc;
	 if (c > 0    && dst[i - 1 ] == 0) findConnectedComponent(i - 1 , n);
	 if (c < nc-1 && dst[i + 1 ] == 0) findConnectedComponent(i + 1 , n);
	 if (r > 0    && dst[i - nc] == 0) findConnectedComponent(i - nc, n);
	 if (r < nr-1 && dst[i + nc] == 0) findConnectedComponent(i + nc, n);
      }

      if (f0 === undefined)
         f0 = 0.5;

      var nr = src.length / nc;

      for (var i = 0 ; i < src.length ; i++)
         dst[i] = 0;

      var n = 0;
      for (var i = 0 ; i < src.length ; i++)
         if (src[i] >= f0 && dst[i] == 0)
	    findConnectedComponent(i, ++n);
   }

   function imageEnlarge(src, dst) {
      if (this.tmp === undefined)
         this.tmp = newArray(dst.length);

      function index(i,j,w) { return max(0,min(w-1,i)) + w * max(0,min(w-1,j)); }

      var w = floor(sqrt(src.length));

      for (var row = 0 ; row < w ; row++)
      for (var col = 0 ; col < w ; col++) {
         var i0 = index(row  , col  , w);
         var i1 = index(row+1, col  , w);
         var i2 = index(row  , col+1, w);
         var i3 = index(row+1, col+1, w);
         var j = index(2*row, 2*col, 2*w);
         this.tmp[j      ] =  src[i0];
         this.tmp[j+1    ] = (src[i0] + src[i1]) / 2;
         this.tmp[j  +2*w] = (src[i0] + src[i2]) / 2;
         this.tmp[j+1+2*w] = (src[i0] + src[i1] + src[i2] + src[i3]) / 4;
      }

      var wt = [1/6,1/3,1/3,1/6];

      for (var row = 0 ; row < 2*w ; row++)
      for (var col = 0 ; col < 2*w ; col++) {
         var sum = 0;
         for (var u = -1 ; u <= 2 ; u++)
         for (var v = -1 ; v <= 2 ; v++)
            sum += this.tmp[index(col+u, row+v, 2*w)] * wt[u+1] * wt[v+1];
         dst[index(col, row, 2*w)] =  sum;
      }
   }


// 2D GEOMETRY UTILITIES.

   // A Rectangle object.

   function Rectangle(left, top, width, height) {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
   };
   Rectangle.prototype = {
      contains : function(x, y) {
         return x >= this.left && x < this.left + this.width &&
                y >= this.top  && y < this.top  + this.height ;
      }
   };


   // Change the length of a curve.

   function adjustCurveLength(curve, targetLength, i0) {
      var n = curve.length;

      var ratio = targetLength / computeCurveLength(curve, i0);

      var x0 = (curve[1][0] + curve[n-1][0]) / 2;
      var y0 = (curve[1][1] + curve[n-1][1]) / 2;

      var p = [];
      for (var i = 0 ; i < n ; i++)
         p.push([curve[i][0], curve[i][1]]);

      for (var i = 2 ; i <= n-2 ; i++) {
         var t = 1 - 4*(i-n/2)*(i-n/2)/n/n;
         var dr = t * (ratio - 1) + 1;
         p[i][0] = mix(x0, p[i][0], dr);
         p[i][1] = mix(y0, p[i][1], dr);
      }

      for (var i = 2 ; i <= n-2 ; i++) {
         curve[i][0] = p[i][0];
         curve[i][1] = p[i][1];
      }
   }

   // Ajust the distance between two 2D points.

   function adjustDistance(A, B, d, e, isAdjustingA, isAdjustingB) {
      var is3D = A.length > 2 && B.length > 2;
      var x = B[0] - A[0];
      var y = B[1] - A[1];
      var z = is3D ? B[2] - A[2] : 0;
      var t = e * (d / Math.sqrt(x * x + y * y + z * z) - 1);
      if (isAdjustingA) {
         A[0] -= t * x;
         A[1] -= t * y;
	 if (is3D) A[2] -= t * z;
      }
      if (isAdjustingB) {
         B[0] += t * x;
         B[1] += t * y;
	 if (is3D) B[2] += t * z;
      }
   }

   // Clip a curve to that part which is entirely outside of a rectangle.

   function clipCurveAgainstRect(src, R) {
      if (src[0] == undefined) return [];
      var dst = [];
      var x1 = src[0][0];
      var y1 = src[0][1];
      if (! isInRect(x1,y1, R))
         dst.push([x1,y1]);
      for (var n = 1 ; n < src.length ; n++) {
         var x0 = x1, y0 = y1;
         x1 = src[n][0];
         y1 = src[n][1];
         var draw0 = ! isInRect(x0,y0, R);
         var draw1 = ! isInRect(x1,y1, R);
         if (draw0 || draw1) {
            if (! draw0)
               dst.push(clipLineToRect(x0,y0, x1,y1, R));
            if (! draw1)
               dst.push(clipLineToRect(x1,y1, x0,y0, R));
            else
               dst.push([x1,y1]);
         }
      }
      return dst;
   }

   // Bend a curve toward a point, ending up at a target length.

   function bendCurve(curve, pt, totalLength, i0) {
      if (i0 === undefined) i0 = 0;

      var n = curve.length;

      // FIND NEAREST POINT ON CURVE.

      var ddMin = Number.MAX_VALUE, im = 0;
      for (var i = 0 ; i < n ; i++) {
         var dx = curve[i][0] - pt[0];
         var dy = curve[i][1] - pt[1];
         var dd = dx * dx + dy * dy;
         if (dd < ddMin) {
            ddMin = dd;
            im = i;
         }
      }

      // IF NOT AT THE ENDS, THEN WARP MIDDLE OF CURVE.

      if (im > n/8 && im < n*7/8) {
         var dx = pt[0] - curve[im][0];
         var dy = pt[1] - curve[im][1];
         for (var i = i0+1 ; i < n-1 ; i++) {
            var t = i < im ? sCurve((i-i0 ) / (im-i0 ))
                           : sCurve((n-1-i) / (n-1-im));
            curve[i][0] += t * dx;
            curve[i][1] += t * dy;
         }
         return;
      }

      //return;

      // IF AT THE ENDS, THEN MOVE ONE ENDPOINT AND PRESERVE LENGTH.

      var ax = curve[i0 ][0], ay = curve[i0 ][1];
      var bx = curve[n-1][0], by = curve[n-1][1];

      var dxa = pt[0] - ax, dya = pt[1] - ay;
      var dxb = pt[0] - bx, dyb = pt[1] - by;

      if (dxa * dxa + dya * dya < dxb * dxb + dyb * dyb) {
         for (var i = n-2 ; i >= i0 ; i--) {
            var t = (n-1-i) / (n-2);
            curve[i][0] += t * dxa;
            curve[i][1] += t * dya;
         }
      }
      else 
         for (var i = i0 + 1 ; i <= n-1 ; i++) {
            var t = (i-1) / (n-2);
            curve[i][0] += t * dxb;
            curve[i][1] += t * dyb;
         }
      //adjustCurveLength(curve, totalLength, i0);
   }

   // FIND x,y,scale FOR ARRAY OF CURVES A TO BEST FIT ARRAY OF CURVES B.

   function bestCurvesFit(A, B) {
      var x = 0, y = 0, z = 0, w = 0;
      for (var n = 0 ; n < A.length ; n++) {
         var xyz = bestCurveFit(A[n], B[n]);
         var t = computeCurveLength(B[n]);
         x += t * xyz[0];
         y += t * xyz[1];
         z += t * xyz[2];
         w += t;
      }
      return [x / w, y / w, z / w];
   }

   // FIND x,y,scale FOR CURVE P TO BEST FIT CURVE Q.

   function bestCurveFit(P, Q) {

      var n = min(P.length, Q.length), a=0, b=0, c=0, d=0, e=0, f=0;
      for (var i = 0 ; i < n ; i++) {
         var px = P[i][0], py = P[i][1], qx = Q[i][0], qy = Q[i][1];
         a += px;
         b += py;
         c += qx;
         d += qy;
         e += px * px + py * py;
         f += px * qx + py * qy;
      }
      return solve([ [n,0,a,c], [0,n,b,d], [a,b,e,f] ]);
   }

   function clipLineToRect(ax,ay, bx,by, R) {
      var tx = bx < R[0] ? (R[0] - ax) / (bx - ax) :
               bx > R[2] ? (R[2] - ax) / (bx - ax) : 10000;
      var ty = by < R[1] ? (R[1] - ay) / (by - ay) :
               by > R[3] ? (R[3] - ay) / (by - ay) : 10000;
      var t = max(0, min(1, min(tx, ty)));
      return [mix(ax, bx, t), mix(ay, by, t)];
   }

   /*
      Return the area of a 2D counterclockwise polygon.
   */

   function computeArea(P) {
      var sum = 0;
      for (var i = 0 ; i < P.length ; i++) {
         var j = (i + 1) % P.length;
         sum += (P[j][0] - P[i][0]) * (P[i][1] + P[j][1]);
      }
      return sum / 2;
   }

   /*
      Find out whether a 3D point is hidden by a 3D triangle.
   */

   var isPointBehindTriangle = function(p, tri) {
      var L = [0,0,0];
      var W = [0,0,0];
      var dist = function(p, L) { return p[0] * L[0] + p[1] * L[1] + L[2]; }

      return function(p, tri) {

         // Loop through the three vertices of the triangle.

         for (var j = 0 ; j < 3 ; j++) {

            // Look at edge formed by the two vertices a and b opposite this vertex.

            var a = tri[(j+1)%3];
            var b = tri[(j+2)%3];

            // From x,y coords of a and b, compute equation of 2d line through them.

            L[0] = b[1] - a[1];
            L[1] = a[0] - b[0];
            L[2] = -(a[0] * L[0] + a[1] * L[1]);

            // Compute fractional distance of point into triangle away from edge.

            W[j] = dist(p, L) / dist(tri[j], L);

            // If point is outside this edge, return false.

            if (W[j] < 0)
               return false;
         }

         // Compare barycentrically weighted z of triangle vertices to z of the point.

         return W[0] * tri[0][2] + W[1] * tri[1][2] + W[2] * tri[2][2] > p[2];
      }
   }();

   // Create a rounded right-angle corner curve.

   function createRoundCorner(a, b, axis) {
      var xPos = a[0] < b[0];
      var yPos = a[1] < b[1];
      var r = [ abs(b[0] - a[0]), abs(b[1] - a[1]) ];
      if (axis == 0) {
         if ( xPos &&  yPos) return arc(a[0], b[1], b[0]-a[0],-TAU/4,     0, 10);
         if ( xPos && !yPos) return arc(a[0], b[1], b[0]-a[0], TAU/4,     0, 10);
         if (!xPos &&  yPos) return arc(a[0], b[1], a[0]-b[0],-TAU/4,-TAU/2, 10);
         if (!xPos && !yPos) return arc(a[0], b[1], a[0]-b[0], TAU/4, TAU/2, 10);
      }
      else {
         if ( xPos &&  yPos) return arc(b[0], a[1], b[0]-a[0], TAU/2, TAU/4, 10);
         if ( xPos && !yPos) return arc(b[0], a[1], b[0]-a[0],-TAU/2,-TAU/4, 10);
         if (!xPos &&  yPos) return arc(b[0], a[1], a[0]-b[0],     0, TAU/4, 10);
         if (!xPos && !yPos) return arc(b[0], a[1], a[0]-b[0],     0,-TAU/4, 10);
      }
   }

   // Create an arc of a circle.

   function arc(x, y, r, angle0, angle1, n) {
      if (n === undefined) n = floor(32 * abs(angle1 - angle0));
      var c = [];
      for (var i = 0 ; i <= n ; i++) {
         var angle = mix(angle0, angle1, i / n);
         c.push([x + r * cos(angle), y + r * sin(angle)]);
      }
      return c;
   }

   function createRoundRect(x, y, w, h, r) {
      var c = [];
      c = c.concat(arc(x+r,y+h-r,r,PI/2,PI,8));
      c = c.concat([[x,y+h-r],[x,y+r]]);
      c = c.concat(arc(x+r,y+r,r,PI,3*PI/2,8));
      c = c.concat([[x+r,y],[x+w-r,y]]);
      c = c.concat(arc(x+w-r,y+r,r,-PI/2,0,8));
      c = c.concat([[x+w,y+r],[x+w,y+h-r]]);
      c = c.concat(arc(x+w-r,y+h-r,r,0,PI/2,8));
      c = c.concat([[x+w-r,y+h],[x+r,y+h]]);
      return c;
   }

   // Compute the bounding rectangle for a curve.

   function computeCurveBounds(src, i0) {
      if (i0 === undefined) i0 = 0;
      var xlo = 10000, ylo = xlo, xhi = -xlo, yhi = -ylo;
      for (var n = i0 ; n < src.length ; n++) {
         xlo = min(xlo, src[n][0]);
         ylo = min(ylo, src[n][1]);
         xhi = max(xhi, src[n][0]);
         yhi = max(yhi, src[n][1]);
      }
      return [xlo,ylo,xhi,yhi];
   }

   // The union of two bounding rectangles.

   function computeUnionOfBounds(a, b) {
      return [ min(a[0],b[0]), min(a[1], b[1]), max(a[2],b[2]), max(a[3],b[3]) ];
   }

   // Create a curved line.

   function createCurve(A, B, curvature, N) {
      if (N === undefined)
         N = 20;

      var ax = A[0], ay = A[1], bx = B[0], by = B[1];
      var dx = 4 * curvature * (bx - ax);
      var dy = 4 * curvature * (by - ay);

      var dst = [];

      // STRAIGHT LINE

      if (curvature == 0) {
         for (var n = 0 ; n <= N ; n++)
            dst.push([mix(ax, bx, n/N), mix(ay, by, n/N)]);
         return dst;
      }

      // CIRCULAR LOOP

      if (abs(curvature) == loopFlag) {
         var mx = (ax + bx) / 2, my = (ay + by) / 2;
         var rx = (ax - bx) / 2, ry = (ay - by) / 2;
         var dir = curvature > 0 ? 1 : -1;

         for (var n = 0 ; n <= N ; n++) {
            var angle = TAU * n / N;
            var c = cos(angle);
            var s = sin(angle) * dir;
            dst.push([ mx + rx * c + ry * s,
                       my - rx * s + ry * c ]);
         }
         return dst;
      }

      // OPEN CURVE

      for (var n = 0 ; n <= N ; n++) {
         var t = n / N;
         var s = mix(t, sCurve(t), abs(curvature));
         var e = t * (1 - t);
         dst.push([mix(ax, bx, s) - e * dy,
                   mix(ay, by, s) + e * dx]);
      }
      return dst;
   }

   // CREATE A SPLINE GUIDED BY A PATH OF KEY POINTS.

   function splineSize(keys) {
      return (keys.length - 1) * 10 + 1;
   }

   function makeSpline(keys, dst) {
      function x(k) { return keys[k][0]; }
      function y(k) { return keys[k][1]; }
      function l(k) { return L[k]; }
      function hermite(a, da, b, db) {
         return  a * ( 2 * ttt - 3 * tt     + 1)
              + da * (     ttt - 2 * tt + t    )
              +  b * (-2 * ttt + 3 * tt        )
              + db * (     ttt -     tt        );
      }

      var N = 10;
      var nk = keys.length;

      var L = [];
      for (var n = 0 ; n < nk-1 ; n++)
         L.push(len(x(n+1) - x(n), y(n+1) - y(n)));

      var ns = 0;
      var spline = dst === undefined ? [] : dst;

      for (var n = 0 ; n < nk-1 ; n++) {

         var dx0 = n > 0 ? (l(n) * (x(n) - x(n-1)) + l(n-1) * (x(n+1) - x(n))) / (l(n-1) + l(n))
                         : 3*x(n + 1) - 2*x(n) - x(n + 2);
         var dy0 = n > 0 ? (l(n) * (y(n) - y(n-1)) + l(n-1) * (y(n+1) - y(n))) / (l(n-1) + l(n))
                         : 3*y(n + 1) - 2*y(n) - y(n + 2);

         var dx1 = n < nk-2 ? (l(n+1) * (x(n+1) - x(n)) + l(n) * (x(n+2) - x(n+1))) / (l(n) + l(n+1))
                            : 2*x(n + 1) - 3*x(n) + x(n - 1);
         var dy1 = n < nk-2 ? (l(n+1) * (y(n+1) - y(n)) + l(n) * (y(n+2) - y(n+1))) / (l(n) + l(n+1))
                            : 2*y(n + 1) - 3*y(n) + y(n - 1);

         for (var i = 0 ; i < N ; i++) {
            var t = i / N, tt = t * t, ttt = t * tt;
            spline[ns++] = [ hermite(x(n), dx0*.9, x(n+1), dx1*.9),
                             hermite(y(n), dy0*.9, y(n+1), dy1*.9) ];
         }
      }
      spline[ns] = [ x(nk-1), y(nk-1) ];
      return spline;
   }

   // Compute the curvature of a curved line from A to B which passes through M.

   function computeCurvature(A, M, B) {
      if (M === undefined) {
	 M = A[floor(A.length / 2)];
	 B = A[A.length - 1];
	 A = A[0];
      }
      var dx = B[0] - A[0];
      var dy = B[1] - A[1];
      var ex = M[0] - (A[0] + B[0]) / 2;
      var ey = M[1] - (A[1] + B[1]) / 2;
      return (dx * ey - dy * ex) / (dx * dx + dy * dy);
   }

   // Compute the total geometric length of a curve.

   function computeCurveLength(curve, i0) {
      var len = 0;
      for (var i = (isDef(i0) ? i0 : 0) ; i < curve.length - 1 ; i++) {
         var dx = curve[i+1][0] - curve[i][0];
         var dy = curve[i+1][1] - curve[i][1];
         len += sqrt(dx * dx + dy * dy);
      }
      return len;
   }

   // Check whether a curve crosses a line.

   function curveIntersectLine(curve, a, b) {
      var dst = [], p = null;
      for (var i = 0 ; i < curve.length - 1 ; i++)
         if ((p = lineIntersectLine(curve[i], curve[i+1], a, b)) != null)
	    dst.push(p);
      return dst;
   }

   // Return distance squared from point [x,y] to curve c.

   function dsqFromCurve(x, y, c) {
      var dsq = 100000;
      for (var i = 0 ; i < c.length - 1 ; i++)
         dsq = min(dsq, dsqFromLine(x, y, c[i], c[i+1]));
      return dsq;
   }

   // Return distance squared from point [x,y] to line segment [a->b].

   function dsqFromLine(x, y, a, b) {
      var ax = a[0] - x, ay = a[1] - y;
      var bx = b[0] - x, by = b[1] - y;
      var dx = bx - ax, dy = by - ay;
      if (ax * dx + ay * dy > 0 || bx * dx + by * dy < 0)
         return min(ax * ax + ay * ay, bx * bx + by * by);
      var aa = ax * ax + ay * ay;
      var ad = ax * dx + ay * dy;
      var dd = dx * dx + dy * dy;
      return aa - ad * ad / dd;
   }

   // Return the point parametric fractional distance t along a curve.

   function getPointOnCurve(curve, t) {
      if (t <= 0) return curve[0];
      if (t >= 1) return curve[curve.length-1];
      var n = curve.length - 1;
      var i = floor(t * n);
      var f = t * n - i;
      return mix(curve[i], curve[i+1], f);
   }

   function isInRect(x,y, R) {
      return x >= R[0] && y >= R[1] && x < R[2] && y < R[3];
   }

   // Find the intersection between two line segments.  If no intersection, return null.

   function lineIntersectLine(a, b, c, d) {
      function L(a) { return a[0] * A[0] + a[1] * A[1]; }

      // FIRST MAKE SURE [c,d] CROSSES [a,b].

      var A = [ b[1] - a[1], a[0] - b[0] ];

      var tb = L(b);
      var tc = L(c);
      var td = L(d);

      if ((tc > tb) == (td > tb))
        return null;

      // THEN FIND THE POINT OF INTERSECTION p.

      var f = (tb - tc) / (td - tc);
      var p = mix(c, d, f);

      // THEN MAKE SURE p LIES BETWEEN a AND b.

      var A = [ b[0] - a[0], b[1] - a[1] ];

      var tp = L(p);
      var ta = L(a);
      var tb = L(b);

      return tp >= ta && tp <= tb ? p : null;
   }

   function rayIntersectCircle(V, W, S) {
      var vx = V[0] - S[0];
      var vy = V[1] - S[1];
      var wx = W[0];
      var wy = W[1];
      var r = S[2];
      var A = wx * wx + wy * wy;
      var B = 2 * (wx * vx + wy * vy);
      var C = vx * vx + vy * vy - r * r;
      var discr = B * B - 4 * A * C;
      if (discr < 0)
         return [];
      var d = sqrt(discr);
      return [(-B - d) / (2 * A), (-B + d) / (2 * A)];
   }

   // Resample a curve to equal geometric spacing.

   function resampleCurve(src, count, _dst) {
      if (count === undefined) count = 100;

      var D = [];
      for (var i = 0 ; i < src.length ; i++)
         D.push(i == 0 ? 0 : D[i-1] + distance(src[i], src[i-1]));
      var dst = _dst === undefined ? [] : _dst;
      dst[0] = cloneArray(src[0]);
      var i = 1;
      var sum = D[src.length-1];
      for (var j = 1 ; j < count ; j++) {
         var d = sum * j / count;
         while (D[i] < d && i < src.length-1)
            i++;
         var f = (d - D[i-1]) / (D[i] - D[i-1]);
         dst[j] = mix(src[i-1], src[i], f);
      }

      // ACCOUNT FOR THE SOURCE CURVE BEING A CLOSED LOOP.

      if ( src[0][0] == src[src.length-1][0] &&
           src[0][1] == src[src.length-1][1] )
         dst[count] = [ src[0][0], src[0][1] ];

      return dst;
   }

   function segmentCurve(src) {

      // IF SRC POINTS ARE TOO CLOSELY SPACED, SKIP OVER SOME.

      var curve = [];
      var i = 0;
      for (var j = i ; j < src.length ; j++) {
         var dx = src[j][0] - src[i][0];
         var dy = src[j][1] - src[i][1];
         if (j == 0 || len(dx, dy) > 2) {
            curve.push([src[j][0],src[j][1]]);
            i = j;
         }
      }

      // COMPUTE DIRECTIONS BETWEEN SUCCESSIVE POINTS.

      function Dx(j) { return directions[j][0]; }
      function Dy(j) { return directions[j][1]; }

      var directions = [];
      for (var i = 1 ; i < curve.length ; i++) {
         var dx = curve[i][0] - curve[i-1][0];
         var dy = curve[i][1] - curve[i-1][1];
         var d = len(dx, dy);
         directions.push([dx / d, dy / d]);
      }

      // WHEREVER CURVE BENDS, SPLIT IT.

      var dst = [];
      for (var j = 0 ; j < directions.length ; j++) {
         if (j==0 || (Dx(j-1) * Dx(j) + Dy(j-1) * Dy(j) < 0.5))
            dst.push([]);
         dst[dst.length-1].push([curve[j][0],curve[j][1]]);
      }

      // DISCARD ALL SUB-CURVES THAT ARE TOO SMALL.

      for (var n = dst.length - 1 ; n >= 0 ; n--) {
         var a = dst[n][0];
         var m = dst[n][floor(dst[n].length / 2)];
         var b = dst[n][dst[n].length - 1];
         if (max(distance(a,m),max(distance(m,b),distance(a,b))) < 10)
            dst.splice(n, 1);
      }

      // RETURN ARRAY OF CURVES.

      return dst;
   }


// 3D GEOMETRY UTILITIES.

   function clipLineToPlane(line, plane) {
      var A = line[0],
          B = line[1],
          a = dot4(A, plane),
          b = dot4(B, plane);
      if (a <= 0 && b <= 0)
         line = [];
      else if (a <= 0)
         line = [ mix(B, A, b / (b - a)), B ];
      else if (b <= 0)
         line = [ A, mix(A, B, a / (a - b)) ];
      return line;
   }


   ///////////////////////////////////////////////////////////////////
   // Rearrange edges into long chains, suitable for defining a glyph.
   ///////////////////////////////////////////////////////////////////

   function edgesToStrokes(e2) {

      // Given side s of connection m, return the xy of the corresponding edge point.

      function c2xy(m, s) {
         var n = C[m][s][0];
         var j = C[m][s][1];
         return e2[n][j];
      }

      var hash = {}, C = [];

      // Hash all the edges to find pairwise connections of matching vertices between them.

      for (var n = 0 ; n < e2.length ; n++)

         // Look at both points of the edge.

         for (var j = 0 ; j < 2 ; j++) {

            // Create a unique hash string for the point.

            var p = e2[n][j];
            var h = p[0] + "," + p[1];

            // If this is the first time we are seeing this point, make a new hash entry.

            if (hash[h] === undefined)
               hash[h] = [n,j];

            // Otherwise, it's a match!  Add both sides of the connection to connections array.

            else
               C.push([ hash[h], [n,j] ]);
         }

      // Build long chains, using these pairwise connections between edges.

      for (var m1 = 0 ; m1 < C.length - 1 ; m1++)

         // Try all remaining connections to see whether this chain can be added to.

         for (var m2 = m1 + 1 ; m2 < C.length ; m2++) {

            // Try prepending each side of the connection to the chain.

            for (var s = 0 ; s < 2 ; s++) {
               var i = 0;

               // The chain must not already have the same side of the same connection.

               var hasIt = false;
               for (var k = 0 ; k < C[m1].length && ! hasIt ; k++)
                  hasIt = C[m1][k][0] == C[m2][s][0] && C[m1][k][1] == C[m2][s][1];

               if (! hasIt && C[m1][i][0] == C[m2][s][0] && C[m1][i][1] != C[m2][s][1]) {
                  var c = C.splice(m2, 1)[0];
                  C[m1] = [c[1-s], c[s]].concat(C[m1]);
                  m2 = m1;
                  break;
               }
            }

            if (m2 == m1)
               continue;

            // If that didn't work, try postpending each side of the connection to the chain.

            for (var s = 0 ; s < 2 ; s++) {
               var i = C[m1].length - 1;

               // The chain must not already have the same side of the same connection.

               var hasIt = false;
               for (var k = 0 ; k < C[m1].length && ! hasIt ; k++)
                  hasIt = C[m1][k][0] == C[m2][s][0] && C[m1][k][1] == C[m2][s][1];

               if (! hasIt && C[m1][i][0] == C[m2][s][0] && C[m1][i][1] != C[m2][s][1]) {
                  var c = C.splice(m2, 1)[0];
                  C[m1] = C[m1].concat([c[s], c[1-s]]);
                  m2 = m1;
                  break;
               }
            }
         }

      // Add in any edges which have been left out.

      for (var n = 0 ; n < e2.length ; n++) {
         var count = 0;
         for (var m = 0 ; m < C.length ; m++)
            for (k = 0 ; k < C[m].length ; k++)
               if (C[m][k][0] == n)
                  count++;

         if (count < 2)
            C.push( [ [n, 0], [n, 1] ] );
      }

      // Finally, package as a set of strokes that can be used to define a glyph.

      var c2 = [];
      for (var m = 0 ; m < C.length ; m++) {
         c2.push( [ c2xy(m, 0) ] );
         for (var k = 1 ; k < C[m].length ; k++)
            c2[m].push( c2xy(m, k) );
         if (C[m][0][0] == C[m][C[m].length-1][0])
            c2[m].push( c2xy(m, 0) );
      }

      return c2;
   }


// VARIOUS MANIPULATIONS OF HTML ELEMENTS.

   // Replace the text of an html element:

   function replaceText(id, newText) {
      document.getElementById(id).firstChild.nodeValue = newText;
   }

   // Set the document's background color:

   function setBackgroundColor(color) {
      document.body.style.background = color;
   }

   // Give "text-like" style to all the buttons of a document:

   function textlike(tagtype, textColor, hoverColor, pressColor) {
      var buttons = document.getElementsByTagName(tagtype);
      for (var i = 0 ; i < buttons.length ; i++) {
         var b = buttons[i];
         b.onmousedown = function() { this.style.color = pressColor; };
         b.onmouseup   = function() { this.style.color = hoverColor; };
         b.onmouseover = function() { this.style.color = hoverColor; };
         b.onmouseout  = function() { this.style.color = textColor; };
         b.style.border = '0px solid black';
         b.style.outline = '0px solid black';
         b.style.margin = 0;
         b.style.padding = 0;
         b.style.color = textColor;
         b.style.fontFamily = 'Helvetica';
         b.style.fontSize = '12pt';
         b.style.backgroundColor = document.body.style.background;
      }
   }

   // Object that makes a button cycle through a set of choices:

   function choice(id,      // id of the button's html tag
                   data) {  // data is an array of strings
      this.index = 0;
      this.data = (typeof data === 'string') ? data.split('|') : data;

      // The button that this choice object will control:

      var button = document.getElementById(id);

      // The button needs to know about this choice object:

      button.choice = this;

      // Initially, set the button's text to the first choice:

      button.firstChild.nodeValue = this.data[0];

      // Every click will set the button's text to the next choice:

      button.onclick = function() {
         var choice = this.choice;
         choice.index = (choice.index + 1) % choice.data.length;
         this.firstChild.nodeValue = choice.data[choice.index];
      }
   }

   function getSpan(id) {
      return document.getElementById(id).firstChild.nodeValue;
   }

   function setSpan(id, str) {
      document.getElementById(id).firstChild.nodeValue = str;
   }

