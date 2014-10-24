function Eye() {
   this.labels = "eye".split(' ');
   this.render = function(elapsed) {
      var open = isDef(this.in[0]) ? max(0, min(1, this.inValue[0]))    : 0.5;
      var lift = isDef(this.in[1]) ? max(0, min(1, this.inValue[1]))-.5 : 0.0;
      var x    = isDef(this.in[2]) ? max(0, min(1, this.inValue[2]))-.5 : 0.0;
      var y    = isDef(this.in[3]) ? max(0, min(1, this.inValue[3]))-.5 : 0.0;

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
   }
}
Eye.prototype = new Sketch;
addSketchType("Eye");
