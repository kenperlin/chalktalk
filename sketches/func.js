
function Func() {
   this.s = -1;

   this.code = [
      ["cos", "cos(x)"],
      ["pow2", "pow(2, x)"],
      ["sin", "sin(x)"],
      ["sqr", "x * x"],
      ["floor", "floor(x-.5)"],
   ];

   this.labels = [];
   for (var i = 0 ; i < this.code.length ; i++)
      this.labels.push(this.code[i][0]);

   function makeCurve(f) {
      var curve = [];
      for (var t = -1 ; t <= 1 ; t += .1)
	    curve.push([t, f(t)]);
	 return curve;
   }

   var curves = [
      makeCurve(function(x) { return cos(PI * x) / PI; }),
      makeCurve(function(x) { return exp(x - 1); }),
      makeCurve(function(x) { return sin(PI * x) / PI; }),
      makeCurve(function(x) { return x * x; }),
      makeCurve(function(x) { return (floor(x)+.5); }),
   ];

   this.render = function(elapsed) {
      var sc = this.size / 400;

      if (this.nPorts == 0) {
         this.addPort("x", -sc, 0);
         this.addPort("f",  sc, 0);
      }

	 var s = this.selection;
	 if (isDef(this.selectedIndex))
         this.selection = this.selectedIndex;
      else
         this.selectedIndex = this.selection;

      m.save();
      m.scale(sc);

      var x = this.getInFloat("x");
      var result = null;
      try {
         eval("result = (" + this.code[s][1] + ")");
      } catch (e) {}
	 if (result != null)
         this.setOutValue("f", result);

      _g.lineWidth /= 3;
	 mLine([ 0,1],[0,-1]);
	 mLine([-1,0],[1, 0]);
      _g.lineWidth *= 3;

      mCurve(curves[s]);

	 m.restore();
   }
}
Func.prototype = new Sketch;
