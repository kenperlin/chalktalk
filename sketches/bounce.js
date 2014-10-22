
   function Bounce() {
      this.labels = "bounce".split(' ');
      this.isBouncing = false;
      this.bouncing = 0;
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 1:
	    this.isBouncing = ! this.isBouncing;
	    break;
	 }
      }
      this.render = function(elapsed) {
	 this.bouncing = this.isBouncing ? min(1, this.bouncing + elapsed)
	                                 : max(0, this.bouncing - elapsed);
         var bouncing = isDef(this.in[0]) ? this.inValue[0] : this.bouncing;

         m.save();
	    this.afterSketch(function() {
	       color(scrimColor(.25));
	       mFillCurve([[-1,0],[1,0],[1,-.15],[-1,-.15]]);
	       color(defaultPenColor);
	    });
	    mLine([-1,0],[1,0]);

	    var s = sin(2 * TAU * time);
	    var y = sqrt(.5 + .5 * s) * bouncing;
	    var h = 1 + min(0, .4 * s * abs(s)) * bouncing;
	    var oval = makeOval(-.5,y,1,h, 32, -TAU/4, -TAU*5/4);
	    this.afterSketch(function() {
	       color(scrimColor(.25));
	       mFillCurve(oval);
	       color(defaultPenColor);
            });
	    mCurve(oval);
         m.restore();

         if (this.nPorts == 0)
	    this.addPort("y", 0, 0);
	 this.setOutValue("y", y);
      }
   }
   Bounce.prototype = new Sketch;
   addSketchType("Bounce");

