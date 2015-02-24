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

   function delay(x,y) {
      if (sk().lpd === undefined)
         sk().lpd = [];
      var buf = sk().lpd;

      buf.push(x);

      var n = max(2, floor(100 * y));
      while (buf.length > n)
         buf.splice(0, 1);

      return buf[0];
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
      ["delay", "delay(x, y)"],
      ["floor", "floor(x-.5)"],
      ["gain" , "x * exp(y)"],
      ["pow2" , "pow(2, x)"],
      ["saw"  , "x-floor(x)"],
      ["sin"  , "sin(x * exp(y))"],
      ["sqr"  , "x * x"],
   ];

   var curves = [
      /* blur  */ makeCurve(function(x) { return [x, x<0?1:1-x]; }), 
      /* cos   */ makeCurve(function(x) { return [x, cos(PI * x) / PI]; }), 
      /* delay */ makeCurve(function(x) { return [(x<-.5?0:x<.5?x+.5:1),(x<-.5?x+1:x<.5?.5:1-x)]; }), 
      /* floor */ makeCurve(function(x) { return [x, (floor(x)+.5)]; }), 
      /* gain  */ makeCurve(function(x) { return [(x<0?x+1:1-x), x/2]; }), 
      /* pow2  */ makeCurve(function(x) { return [x, exp(x - 1)]; }), 
      /* saw   */ makeCurve(function(x) { return [x, x - floor(x)]; }), 
      /* sin   */ makeCurve(function(x) { return [x, sin(PI * x) / PI]; }), 
      /* sqr   */ makeCurve(function(x) { return [x, x * x]; }), 
   ];

   this.labels = [];
   for (var i = 0 ; i < this.code.length ; i++)
      this.labels.push(this.code[i][0]);

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

      _g.lineWidth /= 3;
      mLine([ 0,1],[0,-1]);
      mLine([-1,0],[1, 0]);
      _g.lineWidth *= 3;

      mCurve(curves[s]);
   }
}
