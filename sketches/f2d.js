function() {
   this.label = "f2d";
   this.code = [["function", "(x*x + y*y)/2 - 1/8"]];
   this.is3D = true;
   this.f = function(x,y) {
      var result = this._f(x,y);
      return result == null ? 0 : result;
   }
   this._f = function(x,y) {
      var result = null;
      try {
         eval("result = (" + this.code[0][1] + ")");
      } catch (e) { return 0; }
      return result;
   }
   this.render = function(elapsed) {
      if (this.nPorts == 0) {
         this.addPort("x", -1, 0);
         this.addPort("f",  1, 0);
      }

      lineWidth(1);
      mCurve([[-1,0],[1,0]]);
      mCurve([[0,-1],[0,1]]);

      this.duringSketch(function() {
         mCurve(makeOval(-.5,-.5,1,1));
      });

      this.afterSketch(function() {

         if (this.aa === undefined)
            this.aa = 0;
         if (this.styleTransition > .5)
            this.aa += 3 * elapsed;

         var e = 1/30;
         _g.globalAlpha = min(this.aa, 1);

         for (var x = -1 ; x <= 1.001 ; x += e)
         for (var y = -1 ; y <  0.999 ; y += e) {
            var z0 = this.f(x,y);
            var z1 = this.f(x,y+e);
            lineWidth(z0+z1>0 ? .25 : .1);
            mCurve([ [x,y,z0], [x,y+e,z1] ]);
         }

         for (var x = -1 ; x <  0.999 ; x += e)
         for (var y = -1 ; y <= 1.001 ; y += e) {
            var z0 = this.f(x,y);
            var z1 = this.f(x+e,y);
            lineWidth(z0+z1>0 ? .25 : .1);
            mCurve([ [x,y,z0], [x+e,y,z1] ]);
         }

         var x = this.isInValue("x") ? this.getInFloat("x") : 0;
         var y = this.isInValue("y") ? this.getInFloat("y") : 0;
         var z = this._f(x,y);
         if (z != null) {
            this.setOutValue("f", z);
         }
      });
   }
}
