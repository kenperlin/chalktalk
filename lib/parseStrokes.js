"use strict";

var loopFlag = 1000;
var curvatureCutoff = 0.1;

function parseStrokes(strokes, x, y) {

   var parsedSrc = [];
   for (var n = 0 ; n < strokes.length ; n++)
      parsedSrc = parsedSrc.concat(segmentCurve(strokes[n]));
   var parsed = semanticallyLabelStrokes(parsedSrc);

   var xs     = parsed[0][0];
   var ys     = parsed[0][1];
   var points = parsed[1];
   var lines  = parsed[2];

   // MAKE ALL COORDS RELATIVE TO CENTER-OF-SCALING POINT.

   for (var i = 0 ; i < xs.length ; i++)
      xs[i] -= x;
   for (var i = 0 ; i < ys.length ; i++)
      ys[i] -= y;

   for (var n = 0 ; n < parsedSrc.length ; n++) {
      var s = parsedSrc[n];
      for (var i = 0 ; i < s.length ; i++)
         s[i] = [s[i][0] - x, s[i][1] - y];
   }

   // CREATE CORRESPONDENCE BETWEEN PARSED-SRC STROKES AND PARSED DATA

   var correspondence = [];
   for (var n = 0 ; n < parsedSrc.length ; n++) {
      var s = parsedSrc[n];
      var p0 = s[0], pn = s[s.length-1];

      var dMin = 100000, lineIndex = -1, pointOrder = 0;

      for (var index = 0 ; index < lines.length ; index++) {
         var a = lines[index][0];
         var b = lines[index][1];

         var aIndex = points[a];
         var bIndex = points[b];

         var ax = xs[aIndex[0]];
         var ay = ys[aIndex[1]];

         var bx = xs[bIndex[0]];
         var by = ys[bIndex[1]];

         var da0 = len(ax - p0[0], ay - p0[1]);
         var dan = len(ax - pn[0], ay - pn[1]);
         var db0 = len(bx - p0[0], by - p0[1]);
         var dbn = len(bx - pn[0], by - pn[1]);

         var order = da0 + dbn < dan + db0 ? 0 : 1;
         var d = order == 0 ? da0 + dbn : dan + db0;
         if (d < dMin) {
            dMin = d;
            lineIndex = index;
            pointOrder = order;
         }
      }
      correspondence.push([lineIndex , pointOrder]);
   }
   parsed.push(correspondence);

   return [ parsedSrc , parsed ];
}

function semanticallyLabelStrokes(strokes) {

   // BUILD STATISTICS FOR EACH STROKE.

   var enableSymmetry = [true,true];

   var stats = [];
   for (var n = 0 ; n < strokes.length ; n++) {
      var s = strokes[n];
      var a = s[0], b = s[s.length-1], m = s[floor(s.length/2)];

      // HANDLE LOOPS

      if (distance(a, b) < 20) {

         // ALIGN WITH EITHER THE X OR Y COORDINATE.

         var c = [ (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 ];
         var p = [m[0], m[1]];
         var i = abs(p[0] - c[0]) < abs(p[1] - c[1]) ? 0 : 1;
         p[i] = c[i];
         enableSymmetry[1-i] = false;

         var aa = s[floor(s.length/4)];
         var bb = s[floor(s.length*3/4)];
         var ux = b[0] - a[0], uy = b[1] - a[1];
         var vx = bb[0] - aa[0], vy = bb[1] - aa[1];
         var dir = ux * vy < uy * vx ? 1 : -1;

         stats.push([a, p, dir * loopFlag]);
      }
      else
         stats.push([a, b, computeCurvature(a, m, b)]);
   }

   // ALIGN X,Y COORDS OF STROKE ENDPOINTS WHERE POSSIBLE.

   for (var n = 0 ; n < stats.length ; n++)

      // FOR EACH OF THE STROKE'S TWO ENDPOINTS:

      for (var i = 0 ; i < 2 ; i++) {

         // FIND ALL POINTS WITH AN X OR Y COORDINATE NEAR THIS ONE,

         var p = stats[n][i];
         var eq = [ [] , [] ];
         for (m = 0 ; m < stats.length ; m++)
            for (var j = 0 ; j < 2 ; j++) {
               var q = stats[m][j];
               for (var a = 0 ; a < 2 ; a++) {
                  var da = abs(p[ a ] - q[ a ]);
                  var db = abs(p[1-a] - q[1-a]);
                  if (da < 20 || da < db / 10)
                     eq[a].push([m,j]);
               }
            }

         // THEN SET ALL THOSE COORDINATES TO THEIR AVERAGE VALUE.

         for (var a = 0 ; a < 2 ; a++)
            if (eq[a].length > 1) {
               var avg = 0;
               for (var k = 0 ; k < eq[a].length ; k++) {
                  var e = eq[a][k];
                  avg += stats[e[0]][e[1]][a];
               }
               avg /= eq[a].length;
               for (var k = 0 ; k < eq[a].length ; k++) {
                  var e = eq[a][k];
                  stats[e[0]][e[1]][a] = floor(avg + 0.5);
               }
            }
      }

   // FIND ALL THE COORDS AND SORT THEM.

   var xs = new Set();
   var ys = new Set();
   for (var n = 0 ; n < stats.length ; n++)
      for (var u = 0 ; u < 2 ; u++) {
         xs.add(stats[n][u][0]);
         ys.add(stats[n][u][1]);
      }

   xs.sort(function(a,b) { return a>b; });
   ys.sort(function(a,b) { return a>b; });

   // SORT ALL POINTS.

   var xys = new Set();
   for (var n = 0 ; n < stats.length ; n++)
      for (var u = 0 ; u < 2 ; u++)
         xys.add(stats[n][u]);

   xys.sort(function(a,b) { return a[0]<b[0] ? -1 : a[0]>b[0] ? 1 : a[1]-b[1]; });

   var points = [];
   for (var i = 0 ; i < xys.length ; i++)
      points.push([ xs.indexOf(xys[i][0]) , ys.indexOf(xys[i][1]) ]);

   // LABEL ALL THE LINES, AND ARRANGE THEM IN SORTED ORDER.

   var lines = [];
   for (var n = 0 ; n < stats.length ; n++) {
      var s = stats[n];
      var a = xys.indexOf(s[0]);
      var b = xys.indexOf(s[1]);
      var c = abs(s[2]) == loopFlag ? s[2] :
              s[2] <= -curvatureCutoff ? -1 : s[2] >= curvatureCutoff ? 1 : 0;

      if (a == b && c == 0)
         continue; // IGNORE DEGENERATE LINES.

      if (a > b) {
         var tmp = a;
         a = b;
         b = tmp;
         c = -c;
      }

      lines.push([a, b, c]);
   }

   lines.sort(function(a,b) { return a[0]<b[0] ? -1 :
                                     a[0]>b[0] ?  1 :
                                     a[1]!=b[1] ? a[1]-b[1] : a[2]-b[2] ; });

   // ENFORCE BILATERAL SYMMETRY.

   if (enableSymmetry[0] && xs.length == 3)
      xs[1] = (xs[0] + xs[2]) / 2;

   if (enableSymmetry[1] && ys.length == 3)
      ys[1] = (ys[0] + ys[2]) / 2;

   // PACKAGE UP ALL THE PARSED DATA.

   return [ [ xs , ys ] , points , lines ];
}

function parsedStrokesToCurves(parsedStrokes, transition) {
   var parsedSrc = parsedStrokes[0];
   var parsed    = parsedStrokes[1];

   var xs = parsed[0][0];
   var ys = parsed[0][1];
   var points = parsed[1];
   var lines = parsed[2];
   var correspondence = parsed[3];

   var xy = [];
   for (var i = 0 ; i < points.length ; i++)
      xy.push([ xs[points[i][0]], ys[points[i][1]] ]);

   var curves = [];
   for (var n = 0 ; n < parsedSrc.length ; n++) {
      var cSrc = parsedSrc[n];

      var lineIndex  = correspondence[n][0];
      var pointOrder = correspondence[n][1];

      var line = lines[lineIndex];
      var a = line[0];
      var b = line[1];
      var s = line[2];
      var cDst = createCurvedLine(xy[a], xy[b], abs(s)==loopFlag ? s : s * curvatureCutoff);

      curves.push([]);
      for (var u = 0 ; u <= 1 ; u += 0.1) {
         var t = pointOrder == 0 ? u : 1 - u;

         var src = getPointOnCurve(cSrc, u);
         var dst = getPointOnCurve(cDst, t);

         curves[n].push(mix(src, dst, transition));
      }
   }

   return curves;
}

