function() {
   this.label = "s2c";

   this.render = function() {
      mCube();
      this.duringSketch(function() {
         mCurve([ [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1] ]);
      });
   }
}
