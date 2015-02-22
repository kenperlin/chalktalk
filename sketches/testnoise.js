function TestNoise() {
   this.label = 'testNoise';
   var noise = new Noise();
   this.render = function() {
      mCurve([[-1,1],[-1,-1],[1,-1]]);
      this.duringSketch(function() {
         mCurve([[-1,-.2],[-.3,.2,],[.3,-.2],[1,.2]]);
      });
      this.afterSketch(function() {
         var C = [];
         for (var x = -1 ; x <= 1 ; x += .01) {
	    var y = .1 * noise.noise([10*x,time,.5]);
	    C.push([x, y]);
         }
         mCurve(C);
      });
   }
}
TestNoise.prototype = new Sketch;
addSketchType('TestNoise');

