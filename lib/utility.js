"use strict";

/////////////// UTILITY FUNCTIONS ///////////////////

// JAVASCRIPT RELATED.
       //stringify sketch object, called in SketchPage.savePage
   function stringify(obj) {
      var strings = [], prop;
      if (obj == undefined)                           // NULL
         return String(obj);
      else if (typeof(obj) == 'object' && obj.join) { // ARRAY
         for (prop in obj)
            strings.push(toString(obj[prop]));
         return '[' + strings.join(',') + ']';
      }
      else if (typeof(obj) == 'object') {            // OBJECT
         for (prop in obj)
            if (obj.hasOwnProperty(prop))
               strings.push(prop + ':' + toString(obj[prop]));
         return '{' + strings.join(',') + '}';
      }
      else if (typeof(obj) == 'function')             // FUNCTION
         return obj.toString();
      return JSON.stringify(obj);                     // ANYTHING ELSE
   }
   // COPY FROM A DATA OBJECT, BUT LEAVE DST FUNCTIONS UNTOUCHED.

   function copyFromData(src, dst) {
      for (var prop in src) {
         if (src[prop] !== undefined && src[prop] != null && ! isFunction(dst[prop]))
            if (dst[prop] instanceof Array) {
               var s = src[prop][0];
               if (s !== undefined && hasProperties(s) && ! (s instanceof Array)) {
                  for (var n = 0 ; n < dst[prop].length ; n++)
                     if (src[prop][n] !== undefined)
                        copyFromData(src[prop][n], dst[prop][n]);
               }
               else
                  cloneArray(src[prop], dst[prop]);
            }
            else if (! hasProperties(dst[prop]) || typeof dst[prop] === 'string')
               dst[prop] = src[prop];
            else
               copyFromData(src[prop], dst[prop]);
      }
   }

   function copyWithoutFunctions(src) {
      if (src instanceof Array) {
         var a = [];
         for (var i = 0; i < src.length; i++) {
            if (src[i] !== undefined && src[i] !== null)
               a.push(copyWithoutFunctions(src[i]));
         }
         return a;
      } else if (src instanceof Object) {
         var o = {};
         for (var prop in src)
            if (src[prop] !== undefined && src[prop] !== null && !isFunction(src[prop]))
               o[prop] = copyWithoutFunctions(src[prop]);
         return o;
      } else {
         return src;
      }
   }

   // DOES THIS OBJECT HAVE ITS OWN PROPERTIES?

   function hasProperties(x) {
      for (var prop in x) {
         if (Object.prototype.hasOwnProperty.call(x, prop))
            return true;
      }
      return false;
   }

   // IS THIS OBJECT A FUNCTION?

   function isFunction(x) {
     return Object.prototype.toString.call(x) == '[object Function]';
   }

   // SPLICE LINES OF CODE INTO OR OUT OF A FUNCTION.

   function spliceFunction(func, start, deleteCount, code) {

      // CONVERT FUNCTION BODY TO A STRING, AND SPLICE IN NEW CODE.

      var s = '' + func;
      var ss = s.substring(s.indexOf('{') + 1, s.lastIndexOf('}')).split('\n');
      ss.splice(start, deleteCount, code);
      ss.splice(0, 1);
      s = ss.join('\n');

      // REMOVE ANY EXTRA LINES AT THE END CAUSED BY THE JOIN OPERATION.

      while (s.charAt(s.length-1) == '\n')
         s = s.substring(0, s.length-1);
      for (var i = 0 ; s.charAt(i) == ' ' ; i++)
         s += ' ';

      // CREATE AND RETURN THE MODIFIED FUNCTION.

      return new Function(s);
   }

   // RETURN A UNIQUE OBJECT ID.

   var _objectId = 0;
   function objectId(obj) {
      if (obj._objectId === undefined)
         obj._objectId = _objectId++;
      return obj._objectId;
   }

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

   // CODE SHOULD NOT BE PARSED IF IT CONTAINS UNEVALUATED FUNCTIONS,
   // BECAUSE RUNNING eval() WOULD THEN FAIL WITHOUT TRIGGERING AN EXCEPTION.

   function isParsableCode( code ) {
      function isAlpha(c) { return c >= 'a' && c <= 'z'; }

      // REMOVE EVERYTHING BUT SPACE-SEPARATED VARIABLE NAMES AND '(' CHARACTERS.

      var str = code.replace(/[^a-zA-Z_(]/g,' ').replace(/ +/g,' ').replace(/ \(/g,'(');

      for (var i = 0 ; i < str.length ; i++)
         if (isAlpha(str.charAt(i))) {

            // IF WE FIND A FUNCTION NAME NOT FOLLOWED BY A '(', THEN THIS CODE IS UNPARSABLE.

            var j = i + 1;
            for ( ; j < str.length && isAlpha(str.charAt(j)) ; j++)
               ;

            try {
               if ( typeof eval(str.substring(i, j)) === 'function' && str.charAt(j) != '(' )
                  return false;
            }
            catch(e) { }

            i = j;
         }

      return true;
   }


// GET DATA FROM THE MICROPHONE

function Microphone() {
   var that = this;

   this.isOn = true;
   this.context = new (window.AudioContext || window.webkitAudioContext)();
   this.analyser = this.context.createAnalyser();
   this.analyser.fftSize = 256;
   this.timeDomainDataArray = new Float32Array(this.analyser.fftSize);
   this.frequencyDataArray  = new Float32Array(this.analyser.frequencyBinCount);

   navigator.webkitGetUserMedia({ audio: true },
      function (stream) {
         that.context.createMediaStreamSource(stream).connect(that.analyser);
         setInterval(function () {
            if (that.callbackFunction) {
               that.analyser.getFloatTimeDomainData(that.timeDomainDataArray);
               that.analyser.getFloatFrequencyData (that.frequencyDataArray );
               that.callbackFunction(that.timeDomainDataArray, that.frequencyDataArray);
            }
         }, floor(44100 / that.analyser.fftSize));
      },
      function () { }
   );
}

function startMicrophone(callbackFunction) {
   if (window.mike === undefined)
      window.mike = new Microphone();
   mike.callbackFunction = callbackFunction;
}

function stopMicrophone() {
   if (window.mike !== undefined)
      mike.callbackFunction = undefined;
}


// GET AND SET STATE DATA VIA THE PERSISTENT SERVER.

   function Server() {
      var that = this;
      this.name = name;

      this.call = function(name, callback) {
         var request = new XMLHttpRequest();
         request.open('GET', name);
         request.onloadend = function() {
            callback(request.responseText);
         }
         request.send();
      }

      this.upload = function(sketchName, sketchContent) {
         var request = new XMLHttpRequest();
         request.open('POST', 'upload');

         var form = new FormData();
         form.append('sketchName', sketchName);
         form.append('sketchContent', sketchContent);

         request.send(form);
      }

      this.getTT = function(callback) {
         if (! this.getTT_request)
            this.getTT_request = new XMLHttpRequest();
         var request = this.getTT_request;

         request.open('POST', 'getTT');
         request.onloadend = function() {
	    callback(request.responseText);
         }
         var form = new FormData();
         request.send(form);
      }

      this.set = function(key, val) {
         var request = new XMLHttpRequest();
         request.open('POST', 'set');

         var form = new FormData();
         form.append('key', key + '.json');
         form.append('value', JSON.stringify(val));
         request.send(form);
      }

      this.get = function(key, callback, onErr) {
         var request = new XMLHttpRequest();
         request.open('GET', key + '.json');
         request.onloadend = function() {
            if (request.responseText.indexOf('Cannot ') != 0)
               callback(JSON.parse(request.responseText));
            else if (onErr !== undefined)
               onErr(request.responseText);
         }
         request.send();
      }

      this.writeFile = function(fileName, contents) {
         var request = new XMLHttpRequest();
         request.open('POST', 'writeFile');
         var form = new FormData();
         form.append('fileName', fileName);
         form.append('contents', JSON.stringify(contents));
         request.send(form);
      }

      this.socket = null;

      this.connectSocket = function() {

         this.socket = new WebSocket("ws://" + window.location.hostname + ":22346");
         this.socket.binaryType = "arraybuffer";

         var that = this;
         this.socket.onmessage = function(event) {

            var obj = JSON.parse(event.data);

            if (obj.eventType) {
	       obj.event.preventDefault = function() { };
	       (events_canvas[obj.eventType])(obj.event);
	       return;
            }

	    if (obj.global) {
	       try {
	          window[obj.global] = obj.value;
               }
	       catch (e) { }
	       return;
	    }

	    if (obj.code) {
	       try {
	          eval(obj.code);
               }
	       catch (e) { }
	       return;
	    }
         };
         return this.socket;
      };

      this.broadcastGlobal = function(name) {
         this.broadcastObject( { global: name, value: window[name] } );
      };

      this.broadcastCode = function(code) {
	 this.broadcastObject( { code: code } );
      };

      this.broadcastObject = function(object) {
         this.broadcast(JSON.stringify(object));
      }

      this.broadcast = function(message) {
         if (this.socket == null && this.connectSocket() == null) {
            console.log("socket is null, can't broadcast");
            return;
         }

         if (this.socket.readyState != 1) {
            console.log("socket is not open, can't broadcast");
            return;
         }

         this.socket.send(message);
      };
   }
/*
   var server = new Server();
   var socket = server.connectSocket();
*/

// TYPES AND FORMAT CONVERSIONS.

   function arrayDepth(arg) {
      return arg instanceof Array ? arg.length > 0 ? arrayDepth(arg[0]) + 1 : 1 : 0;
   }
   function hexChar(n) {
      return String.fromCharCode((n < 10 ? 48 : 87) + n);
   }
   function hex(n) {
      return hexChar(n >> 4) + hexChar(n & 15);
   }
   function parseHexCode(c) {
      if (c >= 48 && c <= 48 + 9)
         return c - 48;
      if (c >= 96 + 1 && c <= 96 + 6)
         return c - 96 + 10;
      if (c >= 64 + 1 && c <= 64 + 9)
         return c - 64 + 10;
      return 0;
   }
   function parseRGBA(s) {
      var dst = [0,0,0,1];
      if (s.indexOf('#') == 0)
         for (var i = 0 ; i < 3 ; i++)
            dst[i] = parseHexCode(s.charCodeAt(2*i+1)) << 4 | parseHexCode(s.charCodeAt(2*i+2));
      else {
         var s = s.substring(s.indexOf('rgba') == 0 ? 5 : 4, s.indexOf(')')).split(',');
         for (var i = 0 ; i < 3 ; i++)
            dst[i] = parseInt(s[i]);
         if (s.length > 3)
            dst[3] = parseFloat(s[3]);
      }
      return dst;
   }
   function def(v, d) { return v !== undefined ? v : d !== undefined ? d : 0; }
   function isArrayOfArrays(arg) {
      return isDef(arg) &&
             arg instanceof Array &&
	     arg.length > 0 &&
             arg[0] instanceof Array;
   }
   function isDef(v) { return ! (v === undefined); }
   function isMatrixArray(arg) {
      return isDef(arg) &&
             arg instanceof Array &&
	     arg.length == 16 &&
	     isNumeric(arg[0]);
   }
   function isNumeric(v) { return ! isNaN(v); }
   function rounded(v, nDigits) { return Number(roundedString(v, nDigits)); }
   function roundedString(v, nDigits) {
      var nd = nDigits === undefined ? 2 : abs(nDigits);
      if (typeof(v) == 'string')
         v = parseFloat(v);
      var p = nd<=0 ? 1 : nd==1 ? 10 : nd==2 ? 100 : nd==3 ? 1000 : nd==4 ? 10000 : 100000;
      var str = "" + (floor(p * abs(v) + 0.5) / p);

      if (nDigits !== undefined && nd > 0) {
         var i = str.indexOf(".");
         if (i < 0) {
            str += ".";
            i = str.length - 1;
         }
         if (nDigits > 0)
            while (str.length - i < nd + 1)
               str += "0";
      }

      if (nDigits === undefined && str.substring(0, 2) == '0.')
         str = str.substring(1, str.length);

      str = (v < 0 ? "-" : "") + str;

      return str;
   }

// XML WRITING

   var xmlStrokeCount = 0;
   var xmlStrokes = [];

   function xmlWriteStartFrame() {
      xmlStrokes = [];
   }

   function xmlWriteCurve(c) {
      xmlStrokes.push(c);
   }

   function xmlWriteEndFrame() {
      var str = '<Update'
                + ' id="strokes"'
                + ' count="' + xmlStrokes.length + '"'
                + ' time="' + (new Date().getTime()) + '"'
                + '>\n';

      var xOffset = -width () / 2;
      var yOffset = -height() / 2;
      for (var ns = 0 ; ns < xmlStrokes.length ; ns++) {
         str += '<Stroke id="' + ns + '">\n';

         var c = xmlStrokes[ns];
         for (var n = 0 ; n < c.length ; n++)
            str += floor(c[n][0] + xOffset) + ','
                 + floor(c[n][1] + yOffset)
                 + (c[n].length < 3 || c[n][2] == 0 ? '' : ',' + floor(c[n][2]))
                 + '\n';

         str += '</Stroke>\n';
      }

      str += '</Update>';

      console.log(str);
   }

// HANDLE PLAYING AN AUDIO SIGNAL:

   var audioNode = null, audioIndex = 0;

   var signalBuffer = newArray(1024);

   var setAudioSignal = function(f) {
      if (audioNode == null) {
         window.audioContext = 'AudioContext' in window ? new AudioContext() :
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
            if (f === undefined)
               for (var i = 0 ; i < output.length ; i++)
                  signal[i] = 0;
            else if (f instanceof Array)
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
      this.weights = [];
      this.setState(0);
   }
   Choice.prototype = {
      getValue : function(i) {
         if (i === undefined) i = 0;
         return isNaN(this.weights[i]) ? 0 : sCurve(this.weights[i]);
      },
      getState : function(n) {
         return this.stateValue;
      },
      setState : function(n) {
         this.stateValue = n;
         this.update();
      },
      update : function(delta) {
         if (delta === undefined)
            delta = 0;

         while (this.weights.length <= this.stateValue)
            this.weights.push(0);

         for (var i = 0 ; i < this.weights.length ; i++)
            this.weights[i] =
               i == this.stateValue ? min(1, this.weights[i] + 2 * delta)
                                    : max(0, this.weights[i] - delta);
      }
   };


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

   function fractionToRGB(fraction) {
      var t = 5 * fraction;
      switch (floor(t)) {
      case 0 : return [ 0     , 0     , t     ];
      case 1 : return [ 0     , t - 1 , 1     ];
      case 2 : return [ 0     , 1     , 3 - t ];
      case 3 : return [ t - 3 , 1     , 0     ];
      default: return [ 1     , 5 - t , 0     ];
      }
   }


// GRAY SCALE.

   var fractionToGray = (function() {
      var rgbData = [];
      for (var c = 0 ; c < 256 ; c++)
         rgbData.push('rgb(' + c + ',' + c + ',' + c + ')');

      return function(t) {
	 return rgbData[floor(255 * max(0, min(1, t)))];
      }
   })();


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
   function bias(t, p) { return max(0, min(1, pow(t, - log(p) / log(2)))); }
   function ceil(t) { return Math.ceil(t); }
   function cos(t) { return Math.cos(t); }
   function cotan(t) { return Math.cotan(t); }
   function distance(a, b) {
      var dd = 0;
      for (var i = min(a.length, b.length) - 1 ; i >= 0 ; i--)
         dd += (a[i] - b[i]) * (a[i] - b[i]);
      return sqrt(dd);
   }
   function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + (a.length < 3 ? 0 : a[2]*b[2]); }
   function dot4(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]; }
   function exp(t) { return Math.exp(t); }
   function floor(t) { return Math.floor(t); }
   function gain(t, p) { return t < .5 ? bias(2 * t, 1-p) / 2 : 1 - bias(2 * (1 - t), 1-p) / 2; }
   function gaussianElimination(A) { /* From http://martin-thoma.com */
      // Solve a system of linear equations given as an n x n+1 matrix.
      var n = A.length;
      for (var i = 0 ; i < n ; i++) {
         // Search for maximum in this column.
         var maxRow = i, maxEl = abs(A[i][i]);
         for (var k = i + 1 ; k < n ; k++)
            if (abs(A[k][i]) > maxEl) {
               maxEl = abs(A[k][i]);
               maxRow = k;
            }
         // Swap maximum row with current row (column by column).
         for (var k = i ; k < n + 1 ; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
         }
         // Make all rows below this one 0 in current column.
         for (k = i + 1 ; k < n ; k++) {
            var c = -A[k][i] / A[i][i];
            for(var j = i ; j < n + 1 ; j++)
               A[k][j] = i == j ? 0 : A[k][j] + c * A[i][j];
         }
      }
      // Solve equation Ax=b for an upper triangular matrix A.
      var x = new Array(n);
      for (var i = n - 1 ; i > -1 ; i--) {
         x[i] = A[i][n] / A[i][i];
         for (var k = i - 1 ; k > -1 ; k--)
            A[k][n] -= A[k][i] * x[i];
      }
      return x; // Return n x 1 result vector.
   }
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
   function log2(a) { return Math.log2(a); }
   function max(a,b,c,d) {
      return c===undefined ? Math.max(a,b) :
             d===undefined ? Math.max(a,Math.max(b,c))
	                   : Math.max(a,Math.max(b, Math.max(c, d)));
   }
   function min(a,b,c,d) {
      return c===undefined ? Math.min(a,b) :
             d===undefined ? Math.min(a,Math.min(b,c))
	                   : Math.min(a,Math.min(b, Math.min(c, d)));
   }
   function mix(a, b, t) {
      if (t === undefined) return a;
      if (a === undefined) return b;
      if (b === undefined) return a;

      if (! Array.isArray(a) && ! Array.isArray(b))
         return a + (b - a) * t;

      var dst = [];

      if (! Array.isArray(a))
         for (var i = 0 ; i < b.length ; i++)
            dst.push(a + (b[i] - a) * t);

      else if (! Array.isArray(b))
         for (var i = 0 ; i < a.length ; i++)
            dst.push(a[i] + (b - a[i]) * t);

      else
         for (var i = 0 ; i < min(a.length, b.length) ; i++)
            dst.push(a[i] + (b[i] - a[i]) * t);

      return dst;
   }
   function mult(x,y) {
      var dst, i, prop, result, xIsArray, xIsFunction, yIsArray, yIsFunction;

      if (arrayDepth(x) > 1) {
         result = [];
	 for (prop in x)
	    result[prop] = isNumeric(prop) ? mult(x[prop], y) : x[prop];
         return result;
      }

      if (arrayDepth(y) > 1) {
         result = [];
	 for (prop in y)
	    result[prop] = isNumeric(prop) ? mult(x, y[prop]) : y[prop];
         return result;
      }

      xIsFunction = ! Array.isArray(x) && typeof x == 'function';
      yIsFunction = ! Array.isArray(y) && typeof y == 'function';

      if (xIsFunction && yIsFunction) return function(t) { return mult(x(t), y(t)); };
      if (xIsFunction)                return function(t) { return mult(x(t), y   ); };
      if (yIsFunction)                return function(t) { return mult(x   , y(t)); };

      function pad(v) {
         var dst = [], i;
         for (i = 0 ; i < 4 ; i++)
            dst.push(i < v.length ? v[i] : i<3 ? 0 : 1);
         return dst;
      }
      function v_v(a, b) {
         var value = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
         return value;
      }
      function mXm(x, y) {
         var c, dst = [], r;
         for (r = 0 ; r < 4 ; r++)
         for (c = 0 ; c < 4 ; c++)
            dst.push(v_v([x[  r], x[4   + r], x[8   + r], x[12  + r]],
                         [y[4*c], y[4*c + 1], y[4*c + 2], y[4*c + 3]]));
         return dst;
      }
      function mXv(x, y) {
         var dst = [], r;
         for (r = 0 ; r < 4 ; r++)
            dst.push(v_v([x[r], x[4 + r], x[8 + r], x[12 + r]], y));
         return dst;
      }
      function vXm(x, y) {
         var c, dst = [];
         for (c = 0 ; c < 4 ; c++)
            dst.push(v_v(x, [y[4*c], y[4*c + 1], y[4*c + 2], y[4*c + 3]]));
         return dst;
      }
      dst = 0;
      xIsArray = Array.isArray(x);
      yIsArray = Array.isArray(y);
      if (! xIsArray && ! yIsArray) {
         dst = x * y;
      }
      else if (xIsArray && ! yIsArray) {
         dst = [];
         for (i = 0 ; i < x.length ; i++)
            dst.push(x[i] * y);
      }
      else if (! xIsArray && yIsArray) {
         dst = [];
         for (i = 0 ; i < y.length ; i++)
            dst.push(x * y[i]);
      }
      else {
         dst = max(x.length, y.length)  < 16 ? v_v(pad(x), pad(y))
             : min(x.length, y.length) == 16 ? mXm(x, y)
             : x.length                == 16 ? mXv(x, pad(y))
                                             : vXm(pad(x), y);
      }
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
   function noise(x) { return noise2(x, 0); }
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
   function pca(xyw) {
      var angle = 0, ddMax = 0;

      function findBestAngle(t0, t1, dt) {
         var t, u, v, dd, d, i;
         for (t = t0 ; t < t1 ; t += dt) {
            u = Math.cos(t);
            v = Math.sin(t);
	    dd = 0;
            for (i = 0 ; i < xyw.length ; i++) {
	       d = (u * xyw[i][0] + v * xyw[i][1]) * xyw[i][2];
	       dd += d * d;
            }
	    if (dd > ddMax) {
	       ddMax = dd;
	       angle = t;
	    }
	 }
      }

      findBestAngle(0, PI, PI / 10);
      findBestAngle(angle - PI/10, angle + PI/10, PI / 100);
      findBestAngle(angle - PI/100, angle + PI/100, PI / 1000);

      return angle;
   }  
   function pieMenuIndex(x,y,n) {
      if (n === undefined)
         n = 4;
      return floor(n+.5-atan2(y,x) / (TAU/n)) % n;
   }
   function pow(a,b) { return Math.pow(a,b); }
   function pq2m(pq) { // CONVERT POSITION,QUATERNION TO MATRIX.
      var qx = pq[3], qy = pq[4], qz = pq[5], qw = pq[6];
      return [ 1 - 2 * qy * qy - 2 * qz * qz,     2 * qx * qy - 2 * qz * qw,     2 * qz * qx + 2 * qy * qw,  0,
                   2 * qx * qy + 2 * qz * qw, 1 - 2 * qx * qx - 2 * qz * qz,     2 * qy * qz - 2 * qx * qw,  0,
                   2 * qz * qx - 2 * qy * qw,     2 * qy * qz + 2 * qx * qw, 1 - 2 * qx * qx - 2 * qy * qy,  0,
                   pq[0], pq[1], pq[2], 1 ];
   }
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
   function sbias(t, p) { return bias(.5 + .5 * t, p) * 2 - 1; }
   function sgain(t, p) { return gain(.5 + .5 * t, p) * 2 - 1; }
   function sign(t) { return Math.sign(t); }
   function simpleInvert(src, dst) {

         //----- INVERT A 4x4 THAT WAS CREATED BY TRANSLATIONS+ROTATIONS+SCALES

         // COMPUTE ADJOINT COFACTOR MATRIX FOR THE ROTATION+SCALE 3x3

         for (var i = 0 ; i < 3 ; i++)
         for (var j = 0 ; j < 3 ; j++) {
            var i0 = (i+1) % 3;
            var i1 = (i+2) % 3;
            var j0 = (j+1) % 3;
            var j1 = (j+2) % 3;
            dst[j+4*i] = src[i0+4*j0] * src[i1+4*j1] - src[i0+4*j1] * src[i1+4*j0];
         }

         // RENORMALIZE BY DETERMINANT TO GET ROTATION+SCALE 3x3 INVERSE

         var determinant = src[0+4*0] * dst[0+4*0]
                         + src[1+4*0] * dst[0+4*1]
                         + src[2+4*0] * dst[0+4*2] ;
         for (var i = 0 ; i < 3 ; i++)
         for (var j = 0 ; j < 3 ; j++)
            dst[i+4*j] /= determinant;

         // COMPUTE INVERSE TRANSLATION

         for (var i = 0 ; i < 3 ; i++)
            dst[i+4*3] = - dst[i+4*0] * src[0+4*3]
                         - dst[i+4*1] * src[1+4*3]
                         - dst[i+4*2] * src[2+4*3] ;
   }
   function sin(t) { return Math.sin(t); }
   function solveQuadratic(t, A, B, C) {
      var discrim = B * B - 4 * A * C;
      if (discrim < 0)
         return 0;
      var d = Math.sqrt(discrim);
      t[0] = (-B - d) / (2 * A);
      t[1] = (-B + d) / (2 * A);
      return 2;
   }
   function square_wave(t) { return 2 * floor(2*t % 2) - 1; }
   function sqrt(t) { return Math.sqrt(t); }
   function tan(t) { return Math.tan(t); }
   function valueOf(src, u, v) {
      return defaultOrValueOf(0, src, u, v);
   }
   function defaultOrValueOf(defaultValue, src, u, v) {
      if (src === undefined)
         return defaultValue;
      else if (typeof src !== 'function')
         return src;
      else if (v === undefined)
         try { return src(u); } catch(e) { return defaultValue; }
      else
         try { return src(u, v); } catch(e) { return defaultValue; }
   }
   function valueToString(arg) {
      if (isNumeric(arg))
         return roundedString(arg);
      else if (Array.isArray(arg)) {
         let str = "[";
         for (let i = 0 ; i < arg.length ; i++)
            str += valueToString(arg[i]) + (i < arg.length-1 ? "," : "]");
         return str;
      }
      else
         return arg;
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

   var curveForSignal = makeSpline([[-.3,-.1],[-.1,.1],[.1,-.1],[.3,.1]]);


// CHARACTER CONSTANTS AND CONVERSIONS.

   var ALT           = '\u22C0' ;
   var BULLET        = '\u2022' ;
   var C_PHI         = '\u03A6' ;
   var C_SIGMA       = '\u03A3' ;
   var C_THETA       = '\u0398' ;
   var COMMAND       = '\u2318' ;
   var CONTROL       = '\u2201' ;
   var D_ARROW       = '\u2193' ;
   var D_ARROW_SIGN  = '\u8595' ;
   var EXP_2         = '\u00b2' ;
   var EXP_3         = '\u00b3' ;
   var EXP_4         = '\u2074' ;
   var G_OR_EQ       = '\u2265' ;
   var L_ARROW       = '\u2190' ;
   var L_ARROW_SIGN  = '\u8592' ;
   var L_OR_EQ       = '\u2264' ;
   var PAGE_UP       = 'PAGE_UP';
   var PAGE_DN       = 'PAGE_DN';
   var PLUSMN        = '\u00b1' ;
   var R_ARROW       = '\u2192' ;
   var R_ARROW_SIGN  = '\u8594' ;
   var S_ALPHA       = '\u03b1' ;
   var S_BETA        = '\u03b2' ;
   var S_DELTA       = '\u03b4' ;
   var S_EPSILON     = '\u03b5' ;
   var S_PI          = '\u03c0' ;
   var S_PHI         = '\u03C6' ;
   var S_THETA       = '\u03B8' ;
   var SUB_X         = '\u2093' ;
   var SUB_Y         = '\u2094' ;
   var SUB_Z         = '\u2095' ;
   var U_ARROW       = '\u2191' ;
   var U_ARROW_SIGN  = '\u8593' ;

   function charCodeToString(key, isShiftPressed, isControlPressed) {

      if (isControlPressed) {
         switch (key) {
         case  50: return EXP_2;   // SUPERSCRIPT 2
         case  51: return EXP_3;   // SUPERSCRIPT 3
         case  52: return EXP_4;   // SUPERSCRIPT 4
         case  65: return S_ALPHA;
         case  66: return S_BETA;
         case  68: return D_ARROW_SIGN;
         case  69: return S_EPSILON;
         case  70: return S_PHI;
         case  71: return G_OR_EQ;
         case  76: return L_ARROW_SIGN;
         case  77: return PLUSMN;  // PLUS OR MINUS
         case  79: return BULLET;
         case  80: return S_PI;
         case  82: return R_ARROW_SIGN;
         case  83: return isShiftPressed ? C_SIGMA : L_OR_EQ;
         case  84: return S_THETA;
         case  85: return U_ARROW_SIGN;
         case  88: return SUB_X;
         case  89: return SUB_Y;
         case  90: return SUB_Z;
         case 189: return 'larger';
         case 187: return 'smaller';
         }
      }
      if (isShiftPressed)
         switch (key) {
         case 45: return '_';
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
         case 59: return ':';
         case 61: return '+';

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

   function createRandomName(len) {
      if (len === undefined)
         len = 6;

      var charSet = '0123456789_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var seed = (new Date()).getTime();

      function _random() {
          var x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
      }

      function iRandom(n) {
         return floor(n * _random());
      }

      var name = charSet.charAt(10 + (iRandom(53)));
      for (var i = 1 ; i < len ; i++)
         name += charSet.charAt(iRandom(63));

      return name;
   }

   var _manySpaces_ = '                                                                                        ';
   function nSpaces(n) { return _manySpaces_.substring(0, n); }

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

   function arrayMaxDepth(src) {
      var depth = 0;
      if (Array.isArray(src)) {
	 for (var i = 0 ; i < src.length ; i++)
	    depth = max(depth, arrayMaxDepth(src[i]));
         ++depth;
      }
      return depth;
   }

   function arrayToString(a, level) {
      if (a.length == 0)
        return '[]';
      if (level === undefined)
        level = 0;
      var str = '[';
      for (var i = 0 ; i < a.length ; i++)
         str += (a[i] instanceof Array ? arrayToString(a[i], level+1) : isNumeric(a[i]) ? roundedString(a[i]) : a[i])
              + (i < a.length-1 ? ',' : '');
      return str + ']';
   }

   function cloneArray(src, dst) {
      if (src === undefined)
         return undefined;
      if (dst === undefined)
         dst = [];
      for (var i = 0 ; i < src.length ; i++)
         if (src[i] instanceof Array)
            dst[i] = cloneArray(src[i], dst[i]);
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

   function firstUndefinedArrayIndex(arr) {
      var n = 0;
      while (n < arr.length && isDef(arr[n]) && arr[n] != null)
         n++;
      return n;
   }

   function flattenArray(src) {
      if (! (src instanceof Array))
         return src;

      var dst = [];
      for (var n = 0 ; n < src.length ; n++)
	 dst = dst.concat(flattenArray(src[n]));
      return dst;
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
         if (src[i] >= 0)
            dst.push(src[i]);
         else
            for (var n = 0 ; n < -src[i] ; n++)
               dst.push(0);
      if (len !== undefined)
         while (dst.length < len)
            dst.push(0);
      return dst;
   }

   function smoothData(src, nCols) {
      var nRows = src.length / nCols;

      // GET AND SET AN ARRAY ITEM, FORCING COL AND ROW TO STAY IN BOUNDS.

      function get(arr, col, row) {
         col = max(0, min(col, nCols - 1));
         row = max(0, min(row, nRows - 1));
	 return arr[nCols * row + col];
      }
      function set(arr, col, row, value) {
         col = max(0, min(col, nCols - 1));
         row = max(0, min(row, nRows - 1));
	 arr[nCols * row + col] = value;
      }

      var dst = [];
      for (var i = 0 ; i < src.length ; i++)
         dst.push(src[i]);

      // REPLACE ANY OUTLIER VALUES BY AVERAGE OF THEIR NEIGHBORS:

      for (var row = 0 ; row < nRows ; row++)
      for (var col = 0 ; col < nCols ; col++) {
         var p  = get(src, col, row);
         var pL = get(src, col-2, row);
         var pR = get(src, col+2, row);
         var pU = get(src, col, row-2);
         var pD = get(src, col, row+2);
	 if ( p < min(pL, min(pR, min(pU, pD))) ||
	      p > max(pL, max(pR, max(pU, pD))) )
	    set(dst, col, row, (pL + pR + pU + pD) / 4);
      }

      // REDUCE RESOLUTION BY 2 IN EACH DIMENSION THROUGH AVERAGING:

      for (var row = 0 ; row < nRows ; row += 2)
      for (var col = 0 ; col < nCols ; col += 2) {
         var avg = ( get(dst, col, row  ) + get(dst, col+1, row  ) +
	             get(dst, col, row+1) + get(dst, col+1, row+1) ) / 4;
	 set(dst, col  , row  , avg);
	 set(dst, col+1, row  , avg);
	 set(dst, col  , row+1, avg);
	 set(dst, col+1, row+1, avg);
      }

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

   function imageBlur(src, nCols, dst) {
      var nRows = src.length / nCols;
      function index(row, col) { return nCols * max(0, min(nRows - 1, row))
                                              + max(0, min(nCols - 1, col)); }
      var wt = [1/6,1/3,1/3,1/6];
      for (var row = 0 ; row < nRows ; row++)
      for (var col = 0 ; col < nCols ; col++) {
         var sum = 0;
         for (var u = -1 ; u <= 2 ; u++)
         for (var v = -1 ; v <= 2 ; v++)
	    sum += src[index(row + u, col + v)] * wt[u+1] * wt[v+1];
         dst[index(row, col)] = sum;
      }
   }

   function imageReduce(src, nCols, dst) {
      var nRows = src.length / nCols;
      function index(row, col, s) { return nCols/s * max(0, min(nRows/s - 1, row))
                                                   + max(0, min(nCols/s - 1, col)); }
      for (var row = 0 ; row < nRows/2 ; row++)
      for (var col = 0 ; col < nCols/2 ; col++)
         dst[index(row, col, 2)] = ( src[index(2*row    , 2*col    , 1)] +
                                     src[index(2*row + 1, 2*col    , 1)] +
                                     src[index(2*row    , 2*col + 1, 1)] +
                                     src[index(2*row + 1, 2*col + 1, 1)] ) / 4;
   }

   function imageEnlarge(src, nCols, dst) {
      var nRows = src.length / nCols;
      if (this.tmp === undefined)
         this.tmp = newArray(dst.length);
      function index(row, col, s) { return s*nCols * max(0, min(s*nRows - 1, row))
                                                   + max(0, min(s*nCols - 1, col)); }
      for (var row = 0 ; row < nRows ; row++)
      for (var col = 0 ; col < nCols ; col++) {
         var i0 = index(row  , col  , 1);
         var i1 = index(row  , col+1, 1);
         var i2 = index(row+1, col  , 1);
         var i3 = index(row+1, col+1, 1);
         var j  = index(2*row, 2*col, 2);
         this.tmp[j          ] =  src[i0];
         this.tmp[j+1        ] = (src[i0] + src[i1]) / 2;
         this.tmp[j  +2*nCols] = (src[i0] + src[i2]) / 2;
         this.tmp[j+1+2*nCols] = (src[i0] + src[i1] + src[i2] + src[i3]) / 4;
      }

      var wt = [1/6,1/3,1/3,1/6];

      for (var row = 0 ; row < 2*nRows ; row++)
      for (var col = 0 ; col < 2*nCols ; col++) {
         var sum = 0;
         for (var u = -1 ; u <= 2 ; u++)
         for (var v = -1 ; v <= 2 ; v++)
            sum += this.tmp[index(row + u, col + v, 2)] * wt[u+1] * wt[v+1];
         dst[index(row, col, 2)] = sum;
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


   // Find the center of the circle that goes through three given points.

   function findCircleCenter(a, b, c) {
      var p = mix(a, b, .5), A1 = b[0] - a[0], B1 = b[1] - a[1], C1 = -A1 * p[0] - B1 * p[1];
      var q = mix(b, c, .5), A2 = c[0] - b[0], B2 = c[1] - b[1], C2 = -A2 * q[0] - B2 * q[1];
      var x = B1 * C2 - C1 * B2, y = C1 * A2 - A1 * C2, w = A1 * B2 - B1 * A2;
      return [ x / w , y / w ];
   }


   // Adjust the distance between two 2D points.

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

   // Convert a path code to a curve.

   function pathCodeToCurve(args, N) {
      var c, curve = [], dx, dy, i, j, n, s, theta, turn, x, y;

      if (N === undefined)
         N = 8;
      for (i = 0 ; i < args.length ; i++) {
         if (args[i] instanceof Array)
            curve.push([args[i][0], args[i][1]]);
         else if (curve.length > 0) {
            turn = args[i++];
            x = curve[curve.length - 1][0];
            y = curve[curve.length - 1][1];
            dx = args[i][0] - x;
            dy = args[i][1] - y;
            n = N * Math.abs(turn);
            for (j = 1 ; j <= n ; j++) {
               theta = PI * j / (2 * N);
               s =     Math.sin(theta);
               c = 1 - Math.cos(theta);
               curve.push(turn < 0 ? [ x + s * dx, y + c * dy ]
                                   : [ x + c * dx, y + s * dy ] );
            }
         }
      }
      return curve;
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

   // Nudge a curve toward a point, ending up at a target length.

   function nudgeCurve(curve, pt, totalLength, i0) {
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
      return gaussianElimination([ [n,0,a,c], [0,n,b,d], [a,b,e,f] ]);
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
      if (x === undefined) x = 0;
      if (y === undefined) y = 0;
      if (r === undefined) r = 1;
      if (angle0 === undefined) angle0 = 0;
      if (angle1 === undefined) angle1 = TAU;
      if (n === undefined) n = floor(16 * abs(angle1 - angle0));
      var c = [];
      for (var i = 0 ; i <= n ; i++) {
         var angle = mix(angle0, angle1, i / n);
         c.push([x + r * cos(angle), y + r * sin(angle)]);
      }
      return c;
   }

   function createRoundRect(x, y, w, h, r) {
      return     makeOval(x      ,y+h-2*r, 2*r,2*r, 8,  PI/2,PI    )
         .concat(makeOval(x      ,y      , 2*r,2*r, 8,  PI  ,3*PI/2))
         .concat(makeOval(x+w-2*r,y      , 2*r,2*r, 8, -PI/2,0     ))
         .concat(makeOval(x+w-2*r,y+h-2*r, 2*r,2*r, 8,  0   ,PI/2  ));
   }

   // Build a curve from component lines, quarter-circles and semi-circles.

   var buildCurve = function(args) {
      return buildGeneralCurve(args, 8);
   }

   var buildSimpleCurve = function(args) {
      return buildGeneralCurve(args, 1);
   }

   var convertCurveRelativeToAbsolute = function(src) {
      var i, n, dst = [], x = 0, y = 0, dx, dy, theta;

      for (i = 0 ; i < src.length ; i++) {
         if (! (src[i] instanceof Array)) {
            dst.push(n = src[i++]);
	    dx = src[i][0];
	    dy = src[i][1];
            dst.push([x + dx, y + dy]);

            theta = n * PI / 2;
	    s =     Math.sin(theta);
	    c = 1 - Math.cos(theta);
	    x += n < 0 ? s * dx : c * dx;
	    y += n < 0 ? c * dy : s * dy;
         }
	 else {
	    x += src[i][0];
	    y += src[i][1];
            dst.push([x, y]);
         }
      }
      return dst;
   }

   var buildGeneralCurve = function(args, N) {
      var c, curve = [], dx, dy, i, j, n, s, theta, turn, x, y;

      for (i = 0 ; i < args.length ; i++)
         if (args[i] instanceof Array)
            curve.push([args[i][0], args[i][1]]);
         else if (curve.length > 0) {
	    turn = args[i++];
            x = curve[curve.length - 1][0];
            y = curve[curve.length - 1][1];
            dx = args[i][0] - x;
            dy = args[i][1] - y;
            n = N * Math.abs(turn);
            for (j = 1 ; j <= n ; j++) {
               theta = PI * j / (2 * N);
	       s =     Math.sin(theta);
	       c = 1 - Math.cos(theta);
	       curve.push(turn < 0 ? [ x + s * dx, y + c * dy ]
	                           : [ x + c * dx, y + s * dy ] );
            }
         }
      return curve;
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
      return new Bounds(xlo, ylo, xhi, yhi);
   }

   // Create a curved line.

   function createCurvedLine(A, B, curvature) {
      var N = 20;
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

   function randomizeCurve(src, seed) {
      seed = 10 * sin(sin(sin(seed)));
      src = resampleCurve(src, max(2, floor(10 * computeCurveLength(src))));
      var dst = [];
      for (var i = 0 ; i < src.length ; i++) {
         dst.push([ src[i][0] + sin(src[i][0] * 2 + sin(src[i][1] * 2 + seed)) / 7,
                    src[i][1] + sin(src[i][1] * 2 + sin(src[i][0] * 2 + seed)) / 9 ]);
      }
      return dst;
   }

   // CREATE A SPLINE GUIDED BY A PATH OF KEY POINTS.

   function splineSize(keys) {
      return (keys.length - 1) * 10 + 1;
   }

   function makeSpline(keys, dst) {
      var spline = dst;
      if (spline === undefined)
         spline = [];

      var N = 10;
      var nk = keys.length;
      var ns = 0;

      if (nk == 2) {
         for (var i = 0 ; i <= N ; i++)
            spline[ns++] = mix(keys[0], keys[1], i / N);
         return spline;
      }

      function x(k) { return keys[k].x !== undefined ? keys[k].x : keys[k][0]; }
      function y(k) { return keys[k].y !== undefined ? keys[k].y : keys[k][1]; }
      function z(k) { return keys[k].z !== undefined ? keys[k].z : keys[k].length > 2 ? keys[k][2] : 0; }
      function l(k) { return L[k]; }
      function hermite(a, da, b, db) {
         return  a * ( 2 * ttt - 3 * tt     + 1)
              + da * (     ttt - 2 * tt + t    )
              +  b * (-2 * ttt + 3 * tt        )
              + db * (     ttt -     tt        );
      }
      function append(x,y,z) {
         if (keys[0].length == 2)
            spline[ns++] = [x,y];
         else
            spline[ns++] = [x,y,z];
      }

      var L = [];
      for (var n = 0 ; n < nk-1 ; n++) {
         var dx = x(n+1) - x(n), dy = y(n+1) - y(n), dz = z(n+1) - z(n);
         L.push(sqrt(dx * dx + dy * dy + dz * dz));
      }

      var D = [];
      for (var n = 0 ; n < nk ; n++)
         D.push([ n == 0 ? (3*x(n+1) - 2*x(n) - x(n+2)) / 3
                : n<nk-1 ? (l(n) * (x(n) - x(n-1)) + l(n-1) * (x(n+1) - x(n))) / (l(n-1) + l(n))
                         : (2*x(n) - 3*x(n-1) + x(n-2)) / 3
                ,
                  n == 0 ? (3*y(n+1) - 2*y(n) - y(n+2)) / 3
                : n<nk-1 ? (l(n) * (y(n) - y(n-1)) + l(n-1) * (y(n+1) - y(n))) / (l(n-1) + l(n))
                         : (2*y(n) - 3*y(n-1) + y(n-2)) / 3
                ,
                  n == 0 ? (3*z(n+1) - 2*z(n) - z(n+2)) / 3
                : n<nk-1 ? (l(n) * (z(n) - z(n-1)) + l(n-1) * (z(n+1) - z(n))) / (l(n-1) + l(n))
                         : (2*z(n) - 3*z(n-1) + z(n-2)) / 3
                ]);


      if (x(0) == x(nk-1) && y(0) == y(nk-1) && z(0) == z(nk-1))
         for (var j = 0 ; j < 3 ; j++)
            D[0][j] = D[nk-1][j] = (D[0][j] + D[nk-1][j]) / 2;

      for (var n = 0 ; n < nk - 1 ; n++) {
         for (var i = 0 ; i < N ; i++) {
            var t = i / N, tt = t * t, ttt = t * tt;
            append(hermite(x(n), D[n][0] * .9, x(n+1), D[n+1][0] * .9),
                   hermite(y(n), D[n][1] * .9, y(n+1), D[n+1][1] * .9),
                   hermite(z(n), D[n][2] * .9, z(n+1), D[n+1][2] * .9));
         }
      }
      append(x(nk - 1), y(nk - 1), z(nk - 1));
      return spline;
   }

   // Make a B-spline

   function evalCubic(A, t) { return A[0] * t*t*t + A[1] * t*t + A[2] * t + A[3]; }

   function bsplineMatrix() {
      return [-1/6,3/6,-3/6,1/6, 3/6,-6/6,0,4/6, -3/6,3/6,3/6,1/6, 1/6,0,0,0];
   }

   function makeBSpline(P, nt, isLoop) {
      var nm, n, n1, n2, nEnd, X, Y, Z, cubic, t, curve;
      var Bspline = bsplineMatrix();

      curve = [];
      for (n = isLoop ? 0 : 1 ; n < P.length - (isLoop ? 0 : 2) ; n++) {
         nm = ((n - 1) + P.length) % P.length;
         n1 = ( n + 1            ) % P.length;
         n2 = ( n + 2            ) % P.length;
	 X = CT.matrixTransform(Bspline, [ P[nm][0], P[n][0], P[n1][0], P[n2][0] ]);
	 Y = CT.matrixTransform(Bspline, [ P[nm][1], P[n][1], P[n1][1], P[n2][1] ]);
	 Z = CT.matrixTransform(Bspline, [ def(P[nm][2],0), def(P[n ][2],0),
	                                   def(P[n1][2],0), def(P[n2][2],0) ]);
         for (t = 0 ; t < .999 ; t += 1 / nt)
	    curve.push( [ evalCubic(X, t), evalCubic(Y, t), evalCubic(Z, t) ]);
      }
      return curve;
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
      if (curve.length == 0)
         return [];
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

   // Resample an array of floating point values.

   function resampleArray(src, nd) {
      var ns = src.length, dst = newArray(nd);
      for (var id = 0 ; id < nd ; id++) {
         let ts = (ns - 1) * id / (nd - 1);
	 let is = floor(ts);
	 dst[id] = mix(src[is], src[min(ns - 1, is + 1)], ts - is);
      }
      return dst;
   }

   // Resample a curve to equal geometric spacing.

   function resampleCurve(src, count, _dst) {
      var dst = def(_dst, []);
      if (src.length == 0)
         return dst;

      if (count === undefined) count = 100;

      var D = [];
      for (var i = 0 ; i < src.length ; i++)
         D.push(i == 0 ? 0 : D[i-1] + distance(src[i], src[i-1]));
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

      if ( distance(src[0], src[src.length-1]) < 0.01)
         dst[count-1] = [ dst[0][0], dst[0][1] ];

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

   function mimicParamCurve(stroke, params, curve) {
      var i, nPoints, pcurve;

      // REMOVE ARC INDICATORS BEFORE BUILDING A "BEST-FIT" POLYLINE.

      nPoints = 0;
      for (i = 0 ; i < curve.length ; i++)
         if (curve[i] instanceof Array)
	    nPoints++;

      pcurve = mimicPolyline(stroke, nPoints);

      // WHEN DONE, ADD THE ARC INDICATORS BACK.

      for (i = 0 ; i < curve.length ; i++)
         if (! (curve[i] instanceof Array))
	    pcurve.splice(i, 0, curve[i]);

      return pcurve;
   }

   function mimicPolyline(stroke, nPoints) {
      var i, indices, keyPoints = [];

      // KEYPOINTS CONSIST OF FIRST POINT, THEN INFLECTION POINTS, THEN LAST POINT OF STROKE.

      indices = findCurveInflections(stroke, nPoints - 2);

      keyPoints.push(stroke[0]);
      for (i = 0 ; i < indices.length ; i++)
         keyPoints.push(stroke[indices[i]]);
      keyPoints.push(stroke[stroke.length - 1]);

      return keyPoints;
   }

   function findCurveInflections(stroke, nInflections) {
      var dotProd = [], i, j, dp, N = 3, dpMin, iMin, indices;

      for (i = 0 ; i < stroke.length ; i++) {
         dp = 1000;
         if (i >= N && i < stroke.length - N) {
            var x0 = stroke[i][0] - stroke[i-N][0];
            var y0 = stroke[i][1] - stroke[i-N][1];
            var x1 = stroke[i+N][0] - stroke[i][0];
            var y1 = stroke[i+N][1] - stroke[i][1];
            dp = (x0 * x1 + y0 * y1) / (x0 * x0 + y0 * y0 + x1 * x1 + y1 * y1);
         }
         dotProd.push(dp);
      }

      indices = [];
      while (nInflections--) {

         // FIND INDEX ON CURVE WITH GREATEST INFLECTION

         dpMin = 1000;
         iMin = 0;
         for (i = 0 ; i < dotProd.length ; i++)
            if (dotProd[i] < dpMin) {
               dpMin = dotProd[i];
               iMin = i;
            }

         // INSERT NEXT INFLECTION INDEX IN PROPER ORDER

         for (j = 0 ; j < indices.length ; j++)
            if (indices[j] > iMin)
               break;
         indices.splice(j, 0, iMin);

         // CLEAR OUT THIS AREA OF CURVE, TO AVOID RE-ADDING IT OR ITS NEIGHBORS

         dotProd[iMin-1] = dotProd[iMin] = dotProd[iMin+1] = 1000;
      }
      return indices;
   }

   function buildParamCurves(params, curves) {
      var pcurves = [], n;
      for (n = 0 ; n < curves.length ; n++) 
         pcurves.push(buildParamCurve(params, curves[n]));
      return pcurves;
   }

   function buildParamCurve(params, curve) {
      var pcurve = [], i, p;
      for (i = 0 ; i < curve.length ; i++) {
         p = curve[i];
	 if (p instanceof Array)
            pcurve.push([ params[p[0]], params[p[1]] ]);
         else
            pcurve.push(p);
      }
      return pcurve;
   }

   function matchParamCurve(stroke, params, curve) {
      var cc, n, i, nInflections, indices;
      var cx, cy, imax, n0, n1, dmax, dx, dy, d;

      function differs(a, b) { return abs(a - b) > 0.01; }

      // IF CURVE HAS ONLY ONE SEGMENT, THEN THERE IS NOTHING TO DO.

      cc = characterizeParamCurve(params, curve);
      if (cc.length < 2)
         return [];

      // TO EACH SEGMENT THAT ENDS IN AN INFLECTION POINT, ADD CORRESPONDING INDEX FROM STROKE.
    
      nInflections = 0;
      for (n = 0 ; n < cc.length - 1 ; n++)
         if (differs(cc[n][1], cc[n+1][0]))
            nInflections++;
      indices = findCurveInflections(stroke, nInflections);
      for (n = 0 ; n < cc.length - 1 ; n++)
         if (differs(cc[n][1], cc[n+1][0]))
            cc[n].push(indices[n]);
      cc[cc.length - 1].push(stroke.length - 1);

      function prevIndex(n) {
         while (n > 0 && cc[n].length < 3) n--;
         return n;
      }

      function nextIndex(n) {
         while (n < cc.length-1 && cc[n].length < 3) n++;
         return n;
      }

      // FOR SEGMENT JUNCTIONS THAT STILL HAVE NO INDEX, FIND THE BEST INDEX.

      for (n = 0 ; n < cc.length - 1 ; n++)
         if (cc[n].length < 3) {
	    cx = cos(cc[n][1]);
	    cy = sin(cc[n][1]);

            // FIND THE POINT ON THE CURVE WHOSE SLOPE BEST MATCHES THE CHARACTERISTIC SLOPE.

	    n0 = prevIndex(n);
	    n1 = nextIndex(n);

	    dmax = -1;
	    imax = floor(((n0==0 ? 0 : cc[n0][2]) + cc[n1][2]) / 2);

	    for (i = n0==0 ? 0 : cc[n0][2] ; i < cc[n1][2] ; i++) {

	       dx = stroke[i+1][0] - stroke[i][0];
	       dy = stroke[i+1][1] - stroke[i][1];
	       d = sqrt(dx * dx + dy * dy);
	       dx /= d;
	       dy /= d;

	       d = dx * cx + dy * cy;
	       if (d > dmax) {
	          dmax = d;
	          imax = i;
	       }
	       else if (d < dmax * 0.5)
	          break;
	    }
	    cc[n].push(imax);
	 }

      indices = [];
      indices.push(0);
      for (n = 0 ; n < cc.length ; n++)
         if (cc[n].length == 3)
	    indices.push(cc[n][2]);
         else
	    indices.push(floor((cc[prevIndex(n)][2] + cc[nextIndex(n)][2]) / 2));

      return indices;
   }

   function characterizeParamCurve(params, curve) {
      var pc = buildParamCurve(params, curve);
      var a0, c = [], da, i, j, px, py, qx, qy, turn;

      // FIND THE ANGLE AT BOTH THE BEGINNING AND THE END OF EACH CURVE SEGMENT.

      for (i = 0 ; i < pc.length - 1 ; i++) {
	 if (pc[i + 1] instanceof Array)
	    c.push([a0 = atan2(pc[i+1][1] - pc[i][1], pc[i+1][0] - pc[i][0]), a0]);
	 else {
	    turn = pc[++i] * PI / 2;
	    px = pc[i - 1][0], py = pc[i - 1][1];
	    qx = pc[i + 1][0], qy = pc[i + 1][1];
	    a0 = turn < 0 ? qx > px ? 0 : PI : qy > py ? PI / 2 : -PI / 2;
	    c.push([a0, a0 + (qx > px == qy > py ? -turn : turn)]);
	 }
      }

      // FORCE ANGLES INTO A REASONABLE RANGE.

      function offset(i, a) { c[i][0] += a; c[i][1] += a; }
      while (c[0][0] + c[0][1] >  TAU) offset(0, -TAU);
      while (c[0][0] + c[0][1] < -TAU) offset(0,  TAU);
      for (i = 0 ; i < c.length - 1 ; i++) {
         da = c[i][1] - c[i+1][0];
	 if ((da / TAU + 100.01) % 1 < .02)
	    for (j = i + 1 ; j < c.length ; j++)
	       offset(j, da);
      }

      return c;
   }

/*
   Better algorithm:

      First call findCurveInflections to find all of the true dihedrals.

      Then go back and look inbetween those for the more subtle features.
*/

   function matchCurveCharacteristics(stroke, cc) {
      var a, b, cd = [], i, j, sd = [], indices = [];

      function dot(a, b) {
         return a[0] * b[0] + a[1] * b[1];
      }

      function normalize(v) {
         var s = sqrt(v[0] * v[0] + v[1] * v[1]);
         v[0] /= s;
         v[1] /= s;
         return v;
      };

      for (i = 0 ; i < cc.length ; i++) {
         a = cc[i][0];
	 b = cc[i][1];
         cd.push([ [cos(a), sin(a)], [cos(b), sin(b)] ]);
      }

      for (i = 0 ; i < stroke.length - 1 ; i++) {
         a = stroke[i];
         b = stroke[i + 1];
         sd.push(normalize([ b[0] - a[0], b[1] - a[1] ]));
      }

       j = 0;
       for (i = 0 ; i < cd.length - 1 ; i++) {
          a = cd[i];
          b = cd[i + 1];
          if (dot(a[1], b[0]) < .8) {
	     for ( ; j < sd.length - 1 ; j++)
	        if (dot(a[1], sd[j]) > .5 && dot(b[0], sd[j+1]) > .5) {
		   indices.push(j++);
		   break;
		}
             if (j == sd.length - 1)
	        console.log("NO DIHEDRAL FOUND");
          }
	  else if (dot(a[0], a[1]) > .5) {
	     for ( ; j < sd.length - 1 ; j++)
	        if (dot(a[1], sd[j]) < .9) {
		   indices.push(j++);
		   break;
		}
             if (j == sd.length - 1)
	        console.log("NO START OF CURVE FOUND");
          }
	  else {
	     for ( ; j < sd.length - 1 ; j++)
	        if (dot(a[1], sd[j]) > .95) {
		   indices.push(j++);
		   break;
		}
             if (j == sd.length - 1)
	        console.log("NO END OF CURVE FOUND");
          }
       }
       return indices;
   }

   function computeCurvesBounds(src) {
      var xlo = 10000, ylo = xlo, xhi = -xlo, yhi = -ylo;
      for (var n = 0 ; n < src.length ; n++)
         for (var i = 0 ; i < src[n].length ; i++)
	    if (src[n][i] instanceof Array) {
               xlo = min(xlo, src[n][i][0]);
               ylo = min(ylo, src[n][i][1]);
               xhi = max(xhi, src[n][i][0]);
               yhi = max(yhi, src[n][i][1]);
            }
      return new Bounds(xlo, ylo, xhi, yhi);
   }

   function curvesNormalize(src) {
      var B = computeCurvesBounds(src);
      var size = max(B.width, B.height);
      var dst = [];
      for (var n = 0 ; n < src.length ; n++) {
         dst.push([]);
         for (var i = 0 ; i < src[n].length ; i++)
            dst[n].push([ (src[n][i][0] - B.x) / size,
                          (src[n][i][1] - B.y) / size ]);
      }
      return dst;
   }

   function footstepCurve() {
       return makeSpline([[-.05,-.98],[-.2,-.8],[-.2,-.1],[-.4,.6],[-.3,.9],
                          [.1,.95],[.4,.6],[.4,-.4],[.3,-.8],[.1,-.97],[-.05,-.98]]);
   }

   function makeCurves(cs) {
      var curves = [], i;

      for (i = 0 ; i < cs.length ; i++)
         curves.push(makeCurve(cs[i]));
      return curves;
   }

   function makeCurve(c) {
      var a, dst = [], i, n, p, q, t;

      if (c.length >= 2)
         for (i = 0 ; i < c.length ; i++)
	    if (c[i] instanceof Array)
               dst.push(c[i]);
            else {
	       p = c[i-1];
	       n = c[i  ];
	       q = c[++i];
               for (t = 1 / 8 ; t <= abs(n) ; t += 1 / 8) {
                  a = PI / 2 * t;
	          dst.push([ mix(p[0], q[0], n < 0 ? sin(a) : 1 - cos(a)),
		             mix(p[1], q[1], n > 0 ? sin(a) : 1 - cos(a)) ]);
               }
            }

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


// VARIOUS MANIPULATIONS OF HTML ELEMENTS.

   // Replace the text of an html element:

   function replaceText(id, newText) {
      document.getElementById(id).firstChild.nodeValue = newText;
   }

   // Set the document's background color:

   function setDocumentBackgroundColor(color) {
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

   // PARSE THE QUERY STRING PART OF THE URL.  RETURN AS A KEY,VALUE MAP.

   function parseQueryString() {
      var href, index, key, n, queryStrings, queries, value;

      queries = {};
      href = window.location.href;
      index = href.indexOf('?');
      if (index > 0) {
         var queryStrings = href.substring(index + 1, href.length).split('&');
         for (n = 0 ; n < queryStrings.length ; n++) {
            var qs = queryStrings[n];
            index = qs.indexOf('=');
            if (index > 0) {
               var key = qs.substring(0, index);
               var value = qs.substring(index+1, qs.length);
               queries[key] = value;
            }
         }
      }
      return queries;
   }

   function smooth(signal, width, nPasses) {
      var i, iLo, iHi, len = signal.length, r = Math.floor(width / 2), sum = []; 
      for (i = 0 ; i < len ; i++)
         sum.push(0);
      while (nPasses--) {
         sum[0] = signal[0];
         for (i = 1; i < len ; i++)
            sum[i] = sum[i-1] + signal[i];
         for (i = 0; i < len ; i++) {
	    iLo = (i + len   - r) % len;
	    iHi = (i + width - r) % len;
            signal[i] = sum[iHi] - sum[iLo];
	    if (iLo > iHi)
	       signal[i] += sum[len-1];
	    signal[i] /= width;
         }
      }
   }

