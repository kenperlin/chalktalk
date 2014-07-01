
/////////////// UTILITY FUNCTIONS ///////////////////

// TYPES AND FORMAT CONVERSIONS.

   function hexChar(n) {
      return String.fromCharCode((n < 10 ? 48 : 87) + n);
   }
   function hex(n) {
      return hexChar(n >> 4) + hexChar(n & 15);
   }
   function isDef(v) { return ! (v === undefined); }
   function isNumber(v) { return ! isNaN(v); }
   function roundedString(v) {
      if (typeof(v) == 'string')
         v = parseFloat(v);
      return "" + ((v < 0 ? -1 : 1) * floor(100 * abs(v) + 0.5) / 100);
   }

// HANDLE PLAYING AN AUDIO SIGNAL:

   var audioNode = null, audioIndex = 0;

   var setAudioSignal= function(f) {
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
      this.weights = [];
      this.set = function(n) {
         this.value = n;
         this.update();
      }
      this.get = function(i) {
         return sCurve(this.weights[i]);
      }
      this.update = function(delta) {
         if (delta === undefined)
            delta = 0;

         while (this.weights.length <= this.value)
            this.weights.push(0);

         for (var i = 0 ; i < this.weights.length ; i++)
            this.weights[i] =
               i == this.value ? min(1, this.weights[i] + 2 * delta)
                               : max(0, this.weights[i] - delta);
      }
      this.set(0);
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
   function asin(a) { return Math.asin(a); }
   function atan(a) { return Math.atan(a); }
   function atan2(a, b) { return Math.atan2(a, b); }
   function cos(t) { return Math.cos(t); }
   function cotan(t) { return Math.cotan(t); }
   function distance(a, b) { return len(a[0] - b[0], a[1] - b[1]); }
   function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
   function isEqualArray(a, b) {
      if (a === undefined || b === undefined ||
          a == null || b == null || a.length != b.length)
         return false;
      for (var i = 0 ; i < a.length ; i++)
         if (a[i] != b[i])
            return false;
      return true;
   }
   function floor(t) { return Math.floor(t); }
   function ik(a, b, C, D) {
      var cc = dot(C,C), x = (1 + (a*a - b*b)/cc) / 2, y = dot(C,D)/cc;
      for (var i = 0 ; i < 3 ; i++) D[i] -= y * C[i];
      y = sqrt(max(0,a*a - cc*x*x) / dot(D,D));
      for (var i = 0 ; i < 3 ; i++) D[i] = x * C[i] + y * D[i];
   }
   function len(x, y) {
      if (y === undefined)
         return sqrt(x[0] * x[0] + x[1] * x[1]);
      return sqrt(x * x + y * y);
   }

   function lerp(t, a, b) { return a + t * (b - a); }
   function max(a,b) { return Math.max(a,b); }
   function min(a,b) { return Math.min(a,b); }

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
      return lerp(t, lerp(s, u*U[a] +  v   *V[a], (u-1)*U[b] +  v   *V[b]),
                     lerp(s, u*U[c] + (v-1)*V[c], (u-1)*U[d] + (v-1)*V[d]));
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
   function square_wave(t) { return 2 * floor(2*t % 2) - 1; }
   function sqrt(t) { return Math.sqrt(t); }
   function tan(t) { return Math.tan(t); }
   function value(t) { return isDef(t) ? t : "0"; }

// CHARACTER CONSTANTS AND CONVERSIONS.

   var ALT     = '\u22C0' ;
   var C_PHI   = '\u03A6' ;
   var C_THETA = '\u0398' ;
   var COMMAND = '\u2318' ;
   var CONTROL = '\u2201' ;
   var D_ARROW = '\u2193' ;
   var L_ARROW = '\u2190' ;
   var PAGE_UP = 'PAGE_UP';
   var PAGE_DN = 'PAGE_DN';
   var R_ARROW = '\u2192' ;
   var S_PHI   = '\u03C6' ;
   var S_THETA = '\u03B8' ;
   var U_ARROW = '\u2191' ;

   function charCodeToString(key) {
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

// ARRAY UTILITIES.

   function arrayToString(a, level) {
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

   function findEmptySlot(arr) {
      var n = 0;
      while (n < arr.length && isDef(arr[n]) && arr[n] != null)
         n++;
      return n;
   }

   function getIndex(arr, obj) {
      var i = arr.length;
      while (--i >= 0 && arr[i] != obj) ;
         return i;
   }

// 2D GEOMETRY UTILITIES.

   function isInRect(x,y, R) {
      return x >= R[0] && y >= R[1] && x < R[2] && y < R[3];
   }

   function clipLineToRect(ax,ay, bx,by, R) {
      var tx = bx < R[0] ? (R[0] - ax) / (bx - ax) :
               bx > R[2] ? (R[2] - ax) / (bx - ax) : 10000;
      var ty = by < R[1] ? (R[1] - ay) / (by - ay) :
               by > R[3] ? (R[3] - ay) / (by - ay) : 10000;
      var t = max(0, min(1, min(tx, ty)));
      return [lerp(t, ax, bx), lerp(t, ay, by)];
   }

   // Create an arc of a circle.

   function createArc(x, y, r, angle0, angle1, n) {
      var c = [];
      for (var i = 0 ; i <= n ; i++) {
         var angle = lerp(i / n, angle0, angle1);
         c.push([x + r * cos(angle), y + r * sin(angle)]);
      }
      return c;
   }

   function createRoundRect(x, y, w, h, r) {
      var c = [];
      c = c.concat(createArc(x+r,y+h-r,r,PI/2,PI,8));
      c = c.concat([[x,y+h-r],[x,y+r]]);
      c = c.concat(createArc(x+r,y+r,r,PI,3*PI/2,8));
      c = c.concat([[x+r,y],[x+w-r,y]]);
      c = c.concat(createArc(x+w-r,y+r,r,-PI/2,0,8));
      c = c.concat([[x+w,y+r],[x+w,y+h-r]]);
      c = c.concat(createArc(x+w-r,y+h-r,r,0,PI/2,8));
      c = c.concat([[x+w-r,y+h],[x+r,y+h]]);
      return c;
   }

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
         p[i][0] = lerp(dr, x0, p[i][0]);
         p[i][1] = lerp(dr, y0, p[i][1]);
      }

      for (var i = 2 ; i <= n-2 ; i++) {
         curve[i][0] = p[i][0];
         curve[i][1] = p[i][1];
      }
   }

   // Bend a curve toward a point, ending up at a target length.

   function bendCurve(curve, pt, len, i0) {
      if (i0 === undefined) i0 = 0;
      var n = curve.length;
      var dx0 = pt[0] - curve[1][0];
      var dy0 = pt[1] - curve[1][1];
      var dx1 = pt[0] - curve[n-1][0];
      var dy1 = pt[1] - curve[n-1][1];
      if (dx0 * dx0 + dy0 * dy0 < dx1 * dx1 + dy1 * dy1)
         for (var i = n-2 ; i >= i0 ; i--) {
            var t = (n-1-i) / (n-2);
            curve[i][0] += t * dx0;
            curve[i][1] += t * dy0;
         }
      else
         for (var i = i0 + 1 ; i <= n-1 ; i++) {
            var t = (i-1) / (n-2);
            curve[i][0] += t * dx1;
            curve[i][1] += t * dy1;
         }
      adjustCurveLength(curve, len, i0);
   }

   // Compute the bounding rectangle for a curve.

   function computeCurveBounds(src, i0) {
      if (i0 === undefined) i0 = 0;
      var xlo = 10000, ylo = xlo, xhi = -xlo, yhi = -ylo;
      for (var n = 0 ; n < src.length ; n++) {
         xlo = min(xlo, src[n][0]);
         ylo = min(ylo, src[n][1]);
         xhi = max(xhi, src[n][0]);
         yhi = max(yhi, src[n][1]);
      }
      return [xlo,ylo,xhi,yhi];
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
            dst.push([lerp(n/N, ax, bx), lerp(n/N, ay, by)]);
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
         var s = lerp(abs(curvature), t, sCurve(t));
         var e = t * (1 - t);
         dst.push([lerp(s, ax, bx) - e * dy,
                   lerp(s, ay, by) + e * dx]);
      }
      return dst;
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

   // Compute the curvature of a curved line from A to B which passes through M.

   function computeCurvature(A, M, B) {
      var dx = B[0] - A[0];
      var dy = B[1] - A[1];
      var ex = M[0] - (A[0] + B[0]) / 2;
      var ey = M[1] - (A[1] + B[1]) / 2;
      return (dx * ey - dy * ex) / (dx * dx + dy * dy);
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
      return [ lerp(f, curve[i][0], curve[i+1][0]) ,
               lerp(f, curve[i][1], curve[i+1][1]) ];
   }

   // Resample a curve to equal geometric spacing.

   function resampleCurve(src, count) {
      if (count === undefined) count = 100;

      var D = [];
      for (var i = 0 ; i < src.length ; i++)
         D.push(i == 0 ? 0 : D[i-1] + len(src[i][0]-src[i-1][0],
                                          src[i][1]-src[i-1][1]));
      var dst = [];
      dst.push([src[0][0], src[0][1]]);
      var i = 1;
      var sum = D[src.length-1];
      for (var j = 1 ; j < count ; j++) {
         var d = sum * j / count;
         while (D[i] < d && i < src.length-1)
            i++;
         var f = (d - D[i-1]) / (D[i] - D[i-1]);
         dst.push([lerp(f, src[i-1][0], src[i][0]),
                   lerp(f, src[i-1][1], src[i][1])]);
      }
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

