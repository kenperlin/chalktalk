function() {
   this.label = "s2c";

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ]);
      });
      mCube();
      //this.useInputColors();
   }
}
