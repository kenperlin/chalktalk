function() {
   this.label = "cyl";

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [1,-1],[1,1],[-1,1] ]);
         mCurve([ [-1,1],[-1,-1],[1,-1] ]);
      });
      m.rotateX(PI/2);
      mCylinder();
      this.useInputColors();
   }
}
