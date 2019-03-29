function() {
   this.labels = "Slidex Slidey".split(' ');

   this.disableClickToLink = true;

   this.lo = 0;
   this.hi = 1;
   this.flip = 1;

   this.computeStatistics = function() {
      var c = this.sketchTrace[1 - this.selection];
      this.flip = sign(c[0][1] - c[c.length - 1][1]);
   }

   this.lo = 0;
   this.hi = 1;
   this.t = 0.5;

   this.mouseDrag = function(x, y) {
      var sc = this.size / 180;
      var p = m.transform([x,y]);
      this.t = max(0, min(1, p[this.selection]/sc + .5));
   }

   this.mouseUp = function(x, y) {
      var sc = this.size / 180;
      var p = m.transform([x,y]);
      this.t = max(0, min(1, p[this.selection]/sc + .5));
   }

   this.render = function(elapsed) {
      var s = this.selection;
      var sc = this.size / 180;
      m.scale(sc);

      this.afterSketch(function() {
         if (this.sketchTexts.length == 0) {
            var x = s == 0 ? .6 * sc : 0;
            var y = s == 1 ? .6 * sc : 0;
            this.setSketchText(0, '0', [-x,-y], .05 * sc);
            this.setSketchText(1, '1', [ x, y], .05 * sc);
         }
         this.lo = parseFloat(this.sketchTexts[0].value);
         this.hi = parseFloat(this.sketchTexts[1].value);
      });

      var x = this.t - .5;
      switch (this.selection) {
      case 0:
         mLine([-.5, 0], [.5, 0]);
         mLine([x, -.15 * this.flip], [x, .15 * this.flip]);
         break;
      case 1:
         mLine([0, -.5 * this.flip], [0, .5 * this.flip]);
         mLine([-.15, x], [.15, x]);
         break;
      }
      this.afterSketch(function() {

         // WHEN BOUNDS ARE INTEGER VALUES, DRAW INTERMEDIATE TICK MARKS.

         if (this.lo == floor(this.lo) && this.hi == floor(this.hi)) {
            var n = 1;
            while (n < (this.hi - this.lo) / 50)
               n *= 10;
            for (var i = this.lo + n ; i < this.hi ; i += n) {
               var tw = i % (10 * n) == 0 ? 0.055 : i % (5 * n) == 0 ? .035 : 0.015;
               var t = (i - this.lo) / (this.hi - this.lo) - .5;
               switch (this.selection) {
               case 0: mLine([t, -tw], [t, tw]); break;
               case 1: mLine([-tw, t], [tw, t]); break;
               }
            }
         }
      });
   }

   this.output = function() { return lerp(this.t, this.lo, this.hi); }
}
