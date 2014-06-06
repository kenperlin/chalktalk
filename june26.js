
// TODO: Drag right to double frequency.
// TODO: Drag up to create fractal.

   function Noises() {
      this.labels = "noise1".split(' ');

      this.render = function(elapsed) {
         m.save();
            m.scale(this.size / 400);
	    mLine([-1,0],[1,0]);
	    var c = [];
	    for (var t = -1 ; t <= 1 ; t += 0.03) {
	       var f = 0.5 * noise2(2 * t, 0.5);
	       c.push([t, f]);
	    }
	    mCurve(c);
         m.restore();
      }
   }
   Noises.prototype = new Sketch;

