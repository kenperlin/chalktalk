
   function Func() {
      this.s = -1;

      function blur(x,d) {
	 if (sk().lpb === undefined)
	    sk().lpb = [];

	 sk().lpb.push(x);

	 var n = max(2, floor(100 * d));
	 while (sk().lpb.length > n)
	    sk().lpb.splice(0, 1);

	 if (sk().lpb.length < n)
	    return sk().lpb[sk().lpb.length - 1];

         var sum = 0, wgt = 0;
         for (var i = 0 ; i < n ; i++) {
	    var w = .5 + .5 * cos(TAU * (i / n - .5));
	    sum += w * sk().lpb[i];
	    wgt += w;
         }
         return sum / wgt;
      }

      this.code = [
         ["cos", "cos(x)"],
         ["pow2", "pow(2, x)"],
         ["sin", "sin(x)"],
         ["sqr", "x * x"],
         ["floor", "floor(x-.5)"],
         ["blur", "blur(x,1.0)"],
         ["saw", "x-floor(x)"],
      ];

      this.labels = [];
      for (var i = 0 ; i < this.code.length ; i++)
         this.labels.push(this.code[i][0]);

      function makeCurve(f) {
         var curve = [];
         for (var t = -1 ; t <= 1 ; t += .03)
	    curve.push([t, f(t)]);
	 return curve;
      }

      var curves = [
         makeCurve(function(x) { return cos(PI * x) / PI; }),
         makeCurve(function(x) { return exp(x - 1); }),
         makeCurve(function(x) { return sin(PI * x) / PI; }),
         makeCurve(function(x) { return x * x; }),
         makeCurve(function(x) { return (floor(x)+.5); }),
         makeCurve(function(x) { return x<0?1:1-x; }),
         makeCurve(function(x) { return x - floor(x); }),
      ];

      this.render = function(elapsed) {
         this.elapsed = elapsed;
         var sc = this.size / 400;

         if (this.nPorts == 0) {
            this.addPort("x"  , -sc,   0);
            this.addPort("y1" ,   0, -sc);
            this.addPort("y2" ,   0,  sc);
            this.addPort("out",  sc,   0);
         }

	 var s = this.selection;
	 if (isDef(this.selectedIndex))
            this.selection = this.selectedIndex;
         else
            this.selectedIndex = this.selection;

         m.scale(sc);

         var x = this.isInValue("x") ? this.getInFloat("x") : time;
         var y = this.getInFloat("y1") + this.getInFloat("y2");
         var result = null;
         try {
            eval("result = (" + this.code[s][1] + ")");
         } catch (e) { console.log(e); }
         if (result != null)
            this.setOutPortValue(result);

         // this.setOutPortValue(this.evalCode(this.code[s][1]));

         _g.lineWidth /= 3;
	 mLine([ 0,1],[0,-1]);
	 mLine([-1,0],[1, 0]);
         _g.lineWidth *= 3;

         mCurve(curves[s]);
      }
   }
   Func.prototype = new Sketch;
   addSketchType("Func");

