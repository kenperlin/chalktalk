function() {
   this.label = "F1d";
   this.isPos = false;
   this.onSwipe[5] = ['range', function() { this.isPos = ! this.isPos; }];
   this.code = [["", "t\n"]];
   this.y = 0;

   this.f = function(t) {
      var result = NaN;
      try {
         eval("result = (" + this.code[0][1] + ")");
      } catch (e) { return NaN; }
      return result;
   }
   this.render = function(elapsed) {
      lineWidth(1);
      if (this.isPos) {
         mCurve([[-1,-1],[1,-1]]);
         mCurve([[-1,-1],[-1,1]]);
      }
      else {
         mCurve([[-1,0],[1,0]]);
         mCurve([[0,-1],[0,1]]);
      }

      var e = 1/100;
      var C = [];
      var t = this.isPos ? 0 : -1;
      for ( ; t <= 1 ; t += e) {
         var f = this.f(t);
	 if (! isNaN(f)) {
	    if (this.isPos)
               C.push([2 * t - 1, 2 * f - 1]);
            else
               C.push([t, f]);
         }
      }
      lineWidth(2);
      mCurve(C);

      this.afterSketch(function() {
         if (this.isInValueAt(0)) {
            var t = this.getInValue(0, 0);
            this.y = this.f(t);
            if (this.y != null) {
	       lineWidth(1);
               var tt = max(-1, min(1, t));
               var yy = max(-1, min(1, this.y));
               var y0 = 0;
	       if (this.isPos) {
	          tt = 2 * tt - 1;
	          yy = 2 * yy - 1;
	          y0 = 2 * y0 - 1;
	       }
               mLine( [tt, y0], [tt, yy] );
               mFillDisk( [tt, yy], 0.1 );
            }
         }
      });
   }

   this.output = function() { return this.y; }
}
