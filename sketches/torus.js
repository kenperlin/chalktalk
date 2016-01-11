function() {
   this.label = "torus";

   this.render = function() {
      var r = 0.4;
      this.duringSketch(function() {
         mCurve(makeOval(-1-r, -1-r, 2+2*r, 2+2*r, 20, -PI/2, 3*PI/2));
         mCurve(makeOval(-1+r, -1+r, 2-2*r, 2-2*r, 20, -PI/2, 3*PI/2));
      });
      mTorus(80, 80, r);
   }
}
