
   function Weave() {
      this.label = "weave";
      this.is3D = true;
      this.render = function(elapsed) {
	 var C = [];
	 this.duringSketch(function() {
	    for (var i = 0 ; i <= 20 ; i++)
	       C.push([ -sin(2 * TAU * i / 20), 2 * i / 20 - 1 ]);
	 });
	 this.afterSketch(function() {
	    var N = 800;
	    var L = 14;
	    for (var i = 0 ; i <= N ; i++) {
	       var theta = TAU * i / (N / L);
	       var y = 2 * i / N - 1 + sin(6.5 * theta) / L;
	       var r = sqrt(1 - y * y / 2);
	       C.push([
	          r * sin(theta),
		  y,
		  r * cos(theta)
	       ]);
	    }
	 });
         mCurve(C);
      }
   }
   Weave.prototype = new Sketch;
   addSketchType("Weave");

