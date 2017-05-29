function() {
   this.label = "sphere";

   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-1,-1,2,2,20,-PI/2,  PI/2));
         mCurve(makeOval(-1,-1,2,2,20, PI/2,3*PI/2));
      });
      mSphere();
      this.useInputColors();
   }
}
