
   function Rocket() {
      this.labels = "rocket".split(' ');
      this.accel = 0;
      this.velocity = 0;
      this.altitude = 0;
      this.onSwipe = function(dx,dy) {
         var n = pieMenuIndex(dx, dy, 8);
	 switch (n) {
	 case 2:
	    this.accel = .3;
	    break;
	 }
      }
      this.render = function(elapsed) {
         this.velocity += this.accel * elapsed;
         this.altitude += this.velocity;
         m.save();
	 m.rotateZ(-0.02 * this.altitude);
	 m.translate(0, this.altitude, 0);
	 mCurve(createSpline([[0,1],[-.4,0],[-.25,-1]]));
	 mCurve(createSpline([[0,1],[ .4,0],[ .25,-1]]));
	 mCurve([[-.4,0],[-.8,-.8],[-.35,-.8]]);
	 mCurve([[ .4,0],[ .8,-.8],[ .35,-.8]]);
	 this.afterSketch(function(elapsed) {
	 if (this.accel > 0) {
	    var n0 = noise(10*time,0,100) * .5;
	    var n1 = noise(10*time,0,200) * .5;
	    var n2 = noise(10*time,0,300) * .5;
	    mCurve([[-.2,-1.1],[-.3,-1.4+n0],[-.05,-1.15],[0,-1.5+n1],[ .05,-1.15],[ .3,-1.4+n2],[ .2,-1.1]]);
	 }});
         m.restore();
      }
   }
   Rocket.prototype = new Sketch;

