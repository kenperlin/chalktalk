function SplineTest() {
   this.labels = "spline".split(' ');
   this.shape = createSpline([
      [-.3,1.1],
      [-.3, .9],
      [-.3, .5],
      [-.7,-.1],
      [-.7,-.7],
      [-.3,-1 ],
      [ .3,-1 ],
      [ .7,-.7],
      [ .7,-.1],
      [ .3, .5],
      [ .3, .9],
      [ .3,1.1],
   ]);
   this.render = function(elapsed) {
      m.save();
         mCurve(this.shape);
      m.restore();
   }
}
SplineTest.prototype = new Sketch;
