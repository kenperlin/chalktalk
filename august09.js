
   function Rocket() {
      this.labels = "rocket".split(' ');
      this.swipeTime = 0;
      this.velocity = 0;
      this.altitude = 0;
      this.onSwipe = function(dx,dy) {
         var n = pieMenuIndex(dx, dy, 8);
	 switch (n) {
	 case 2:
	    this.swipeTime = time + 0.5;
	    break;
	 }
      }
      this.render = function(elapsed) {
         if (this.swipeTime != 0 && time > this.swipeTime) {
            this.velocity += 0.4 * elapsed;
            this.altitude += this.velocity;
         }

         m.save();

	 // ANIMATE ROCKET TRAJECTORY

         var t = this.altitude;
	 m.rotateZ(-0.02 * t);
	 m.translate(0, t, 0);

	 // DRAW FUSILAGE

	 mCurve(createSpline([[-.25,-1],[-.4,0],[0,1]]));
	 mCurve(createSpline([[0,1],[ .4,0],[ .25,-1]]));

	 // DRAW WINGS

	 mCurve([[-.4,0],[-.8,-.8],[-.35,-.8]]);
	 mCurve([[ .4,0],[ .8,-.8],[ .35,-.8]]);

	 // THRUSTER FLAMES

	 this.afterSketch(function(elapsed) {
	 if (this.swipeTime != 0) {
	    mCurve([[-.20, -1.10], [-.3, -1.4 + .7*noise2(10*time, 100)], 
	            [-.08, -1.15], [  0, -1.6 + .7*noise2(10*time, 200)], 
		    [ .08, -1.15], [ .3, -1.4 + .7*noise2(10*time, 300)], [ .2, -1.1]]);
	 }});

         m.restore();
      }
   }
   Rocket.prototype = new Sketch;

