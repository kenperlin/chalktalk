function() {
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

   function makeCurve(f) {
      var curve = [];
      for (var t = -1 ; t <= 1 ; t += .03)
         curve.push(f(t));
      return curve;
   }

   this.code = [
      ["blur" , "blur(x, y)"],
      ["cos"  , "cos(x * exp(y))"],
      ["floor", "floor(x-.5)"],
      ["pow2" , "pow(2, x)"],
      ["saw"  , "x-floor(x)"],
      ["sin"  , "sin(x * exp(y))"],
      ["sqr"  , "x * x"],
   ];

   var curves = [
      /* blur  */ makeCurve(function(x) { return [x, x<0?1:1-x]; }), 
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
      var x = this.getInValue_DEPRECATED_PORT_SYSTEM(0, time);
      var y = this.getInValue_DEPRECATED_PORT_SYSTEM(1, 0);
      var result = null;
      try {
         eval("result = (" + this.code[this.selection][1] + ")");
      } catch (e) { console.log(e); }
      return result;
   }
}

