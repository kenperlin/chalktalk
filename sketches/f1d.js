function() {
   this.label = "f1d";
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
      mCurve([[-1,0],[1,0]]);
      mCurve([[0,-1],[0,1]]);

      var e = 1/100;
      var C = [];
      for (var t = -1 ; t <= 1 ; t += e) {
         var f = this.f(t);
	 if (! isNaN(f))
            C.push([t, f]);
      }
      lineWidth(2);
      mCurve(C);

      this.afterSketch(function() {
         var t = this.getInValue(0, 0);
         this.y = this.f(t);
         if (this.y != null) {
            color(scrimColor(0.5, this.colorId));
            var tt = max(-1, min(1, t));
            var yy = max(-1, min(1, this.y));
            mFillCurve([ [0,0], [tt,0], [tt,yy], [0,yy] ]);
         }
      });
   }

   this.output = function() { return this.y; }
}
