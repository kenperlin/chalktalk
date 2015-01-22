
   function F1D() {
      this.code = [["", "t*t/2 - 1/8"]];
      this.label = "f1d";

      this.f = function(t) {
         var result = this._f(t);
         return result == null ? 0 : result;
      }
      this._f = function(t) {
         var result = null;
         try {
            eval("result = (" + this.code[0][1] + ")");
         } catch (e) { return 0; }
         return result;
      }
      this.render = function(elapsed) {
         if (this.nPorts == 0) {
            this.addPort("t", -1, 0);
            this.addPort("f",  1, 0);
         }

         lineWidth(1);
         mCurve([[-1,0],[1,0]]);
         mCurve([[0,-1],[0,1]]);

         var e = 1/100;
         var C = [];
         for (var t = -1 ; t <= 1 ; t += e)
            C.push([t, this.f(t)]);
         lineWidth(2);
         mCurve(C);

         this.afterSketch(function() {
            var t = this.isInValue("t") ? this.getInFloat("t") : 0;
            var y = this._f(t);
            if (y != null) {
               this.setOutValue("f", y);
               color(scrimColor(0.5));
               var tt = max(-1, min(1, t));
               var yy = max(-1, min(1, y));
               mFillCurve([ [0,0], [tt,0], [tt,yy], [0,yy] ]);
            }
         });
      }
   }
   F1D.prototype = new Sketch;
   addSketchType("F1D");

