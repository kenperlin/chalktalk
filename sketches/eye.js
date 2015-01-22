function Eye() {
   this.label = "eye";
   this.render = function(elapsed) {

      this.gIV = function(j) { return max(0, min(1, this.getInValue(j, 0.5))); }

      var open = this.gIV(0);
      var lift = this.gIV(1) - .5;
      var x    = this.gIV(2) - .5;
      var y    = this.gIV(3) - .5;

      var upper = makeSpline([ [-1,0], [0, (open + lift) / 2], [1,0] ]);
      var lower = makeSpline([ [-1,0], [0,-(open - lift) / 2], [1,0] ]);

      var ul = .25;
      for ( ; ul > -.25 ; ul -= 0.01)
         if (curveIntersectLine(upper, [x,y-2], [x-.5*cos(ul*TAU), y+.5*sin(ul*TAU)]).length == 0)
	    break;

      var ur = .25;
      for ( ; ur > -.25 ; ur -= 0.01)
         if (curveIntersectLine(upper, [x,y-2], [x+.5*cos(ur*TAU), y+.5*sin(ur*TAU)]).length == 0)
	    break;

      var ll = .25;
      for ( ; ll > -.25 ; ll -= 0.01)
         if (curveIntersectLine(lower, [x,y+2], [x-.5*cos(ll*TAU), y-.5*sin(ll*TAU)]).length == 0)
	    break;

      var lr = .25;
      for ( ; lr > -.25 ; lr -= 0.01)
         if (curveIntersectLine(lower, [x,y+2], [x+.5*cos(lr*TAU), y-.5*sin(lr*TAU)]).length == 0)
	    break;

      mCurve(upper);
      mCurve(lower);
      mCurve(makeOval(x-.5,y-.5,1,1, 32, (.5-ul)*TAU, (.5+ll)*TAU));
      mCurve(makeOval(x-.5,y-.5,1,1, 32,     ur *TAU,    -lr *TAU));

      this.extendBounds(-1, -.8, 1, .8);
   }
}
Eye.prototype = new Sketch;
addSketchType("Eye");
