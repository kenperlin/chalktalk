function() {
   this.s = -1;

   function makeCurve(f) {
      var curve = [];
      for (var t = -1 ; t <= 1 ; t += .03)
         curve.push(f(t));
      return curve;
   }

   this.code = [
      ["cos"  , "cos(x * exp(y))"],
      ["floor", "floor(x-.5)"],
      ["pow2" , "pow(2, x)"],
      ["saw"  , "x-floor(x)"],
      ["sin"  , "sin(x * exp(y))"],
      ["sqr"  , "x * x"],
   ];

   var curves = [
      /* cos   */ makeCurve(function(x) { return [x, cos(PI * x) / PI]; }), 
      /* floor */ makeCurve(function(x) { return [x, (floor(x)+.5)]; }), 
      /* pow2  */ makeCurve(function(x) { return [x, exp(x - 1)]; }), 
      /* saw   */ makeCurve(function(x) { return [x, x - floor(x)]; }), 
      /* sin   */ makeCurve(function(x) { return [x, sin(PI * x) / PI]; }), 
      /* sqr   */ makeCurve(function(x) { return [x, x * x]; }), 
   ];

   this.labels = [];
   for (var i = 0 ; i < this.code.length ; i++)
      this.labels.push(this.code[i][0]);

   this.render = function(elapsed) {
      m.scale(this.size / 400);
      _g.lineWidth /= 3;
      mLine([ 0,1],[0,-1]);
      mLine([-1,0],[1, 0]);
      _g.lineWidth *= 3;
      mCurve(curves[this.selection]);

      if (isDef(this.selectedIndex))
         this.selection = this.selectedIndex;
      else
         this.selectedIndex = this.selection;
   }

   this.output = function() {
      var x = this.getInValue(0, time);
      var y = this.getInValue(1, 0);
      var result = null;
      try {
         eval("result = (" + this.code[this.selection][1] + ")");
      } catch (e) { console.log(e); }
      return result;
   }
}

