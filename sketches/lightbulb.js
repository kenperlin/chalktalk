
   function Lightbulb() {
      this.labels = "lightbulb".split(' ');
      this.light = 0;
      this.mouseDown = function(){};
      this.mouseDrag = function(){};
      this.mouseUp   = function(){};
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 0:
	    this.setColorId((this.colorId + 1) % palette.length);
	    break;
	 case 1:
	    this.light = 1;
	    break;
	 case 2:
	    this.setColorId((this.colorId + palette.length - 1) % palette.length);
	    break;
	 case 3:
	    this.light = 0;
	    break;
	 }
      }
      this.render = function(elapsed) {
         if (this.nPorts == 0)
	    this.addPort("light", 0, 0);
         var light = isDef(this.in[0]) ? this.inValue[0] : this.light;
	 this.setOutValue("light", light);
         m.save();
	    var C = [[-.5,-1.6],[-.55,-1],[-.7,-.7],[-.95,0],[-.7,.7],
	             [0,1],
	             [.7,.7],[.95,0],[.7,-.7],[.55,-1],[.5,-1.6]];
	    mCurve(makeSpline(C));
	    this.afterSketch(function() {
	       color(scrimColor(lerp(light, .25, 1), this.colorId));
	       mFillCurve(makeSpline(C));
	       color(palette[this.colorId]);
	    });
	    color(defaultPenColor);
	    lineWidth(1);
	    for (var s = -1 ; s <= 1 ; s += 2)
               mCurve([[s*.45,-1.6],[s*.5,-1.65],[s*.5,-1.75],
	               [s*.45,-1.8],[s*.5,-1.85],[s*.5,-1.95],
		       [s*.45,-2.0],[s*.5,-2.05],[s*.5,-2.15],
		       [s*.45,-2.2],[s*.3,-2.2]]);
	    mCurve(makeOval(-.3,-2.5,.6,.6,10,PI,2*PI));
         m.restore();
      }
   }
   Lightbulb.prototype = new Sketch;
   addSketchType("Lightbulb");

