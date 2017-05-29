"use strict";

function SketchGlyph(name, src) {
   this.WORST_SCORE = 1000000;

   this.src = src;

   this.toString = function() {
      var str = '"' + this.name + '",\n';
      str += '[';
      for (var n = 0 ; n < this.data.length ; n++) {
         str += '"';
         for (var i = 0 ; i < this.data[n].length ; i++)
            str += ef.encode(this.data[n][i][0] / 100)
                 + ef.encode(this.data[n][i][1] / 100);
         str += '",';
      }
      str += '],';
      return str;
   }

   this.compare = function(other) {
      if (this.data.length != other.data.length)
         return this.WORST_SCORE;

      var score = 0;
      for (var n = 0 ; n < this.data.length ; n++)
         for (var i = 0 ; i < this.data[n].length ; i++) {
            var dx = this.data[n][i][0] - other.data[n][i][0];
            var dy = this.data[n][i][1] - other.data[n][i][1];
            score += dx * dx + dy * dy;
         }
      return score;
   }

   this.toFreehandSketch = function(tx, ty, sc, sketch) {
      var s = new FreehandSketch();
      if (sketch) {
         // NEED TO CHANGE IMPLEMENTATION TO ACCOUNT FOR STRETCH VALUES.
      }
      for (var n = 0 ; n < this.data.length ; n++) {
         for (var i = 0 ; i < this.data[n].length ; i++) {
            var x1 = sc * (this.data[n][i][0] - 50) / 100;
            var y1 = sc * (this.data[n][i][1] - 50) / 100;
            var x = x1 + 4 * noise2(x1 / 30, y1 / 30);
            var y = y1 + 4 * noise2(x1 / 30, y1 / 30 + 100);
            s.sp0.push([x,y]);
            s.sp.push([x,y,i>0]);
         }
      }
      addSketch(s);
      finishSketch();
      s.setColorId(sketchPage.colorId);
      s.tX = tx;
      s.tY = ty;
   }

   this.toSketch = function() {

      // IF A '(' IS FOUND, CALL A FUNCTION.

      if (this.name.indexOf('(') > 0)
         eval(this.name);

      // IF GLYPH IS A DIGIT, CREATE A NUMBER OBJECT.

      else if (isNumeric(parseInt(this.name))) {
         var s = new NumericSketch();
         addSketch(s);
         s.initNumeric(this.name, sketchPage.x, sketchPage.y);
         s.textCursor = s.text.length;
      }

      // DEFAULT: CREATE A TEXT OBJECT.

      else if (this.name != 'del') {
         sketchPage.createTextSketch(this.name);
         setTextMode(true);
      }

      // USE THE TYPE OF THIS GLYPH TO DEFINE A GLYPH NAME FOR THE SKETCH.

      sk().glyph = this;
      sk().glyphName = this.indexName;
   }

   this.name = name;
   this.data = [];

   if (src.length > 0 && typeof(src[0]) == 'string') {
      for (var n = 0 ; n < src.length ; n++) {
         this.data.push([]);
         for (var i = 0 ; i < src[n].length ; i += 2)
            this.data[n].push([ 100 * ef.decode(src[n].substring(i,i+1)),
                                100 * ef.decode(src[n].substring(i+1,i+2)) ]);
      }
      return;
   }

   var N = 100;

   // MOVE AND SCALE STROKES TO FIT WITHIN A UNIT SQUARE.

   var strokes = curvesNormalize(src);

   for (var n = 0 ; n < strokes.length ; n++) {

      // RESCALE EACH STROKE TO FIT WITHIN A 100x100 PIXEL SQUARE.

      var stroke = strokes[n];
      for (var i = 0 ; i < stroke.length ; i++) {
         stroke[i][0] = 50 + 100 * stroke[i][0];
         stroke[i][1] = 50 + 100 * stroke[i][1];
      }

      // COMPUTE FRACTIONAL LENGTHS ALONG STROKE.

      var ns = stroke.length;

      var f = [0], sum = 0;
      for (var i = 1 ; i < ns ; i++)
          f.push(sum += len(stroke[i][0] - stroke[i-1][0],
                            stroke[i][1] - stroke[i-1][1]));
      for (var i = 0 ; i < ns ; i++)
          f[i] /= sum;

      // RESAMPLE TO 100 EQUAL-LENGTH SAMPLES.

      this.data.push([]);
      var i = 0;
      for (var j = 0 ; j < N ; j++) {
         var t = j / (N-1);
         while (i < ns && f[i] <= t)
            i++;
         if (i == ns) {
            this.data[n].push([stroke[ns-1][0], stroke[ns-1][1]]);
            break;
         }
         var u = (t - f[i-1]) / (f[i] - f[i-1]);
         if (i == 0)
            this.data[n].push([stroke[i][0], stroke[i][1]]);
         else
            this.data[n].push(mix(stroke[i-1], stroke[i], u));
      }
   }
}
