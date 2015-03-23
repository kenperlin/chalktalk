function() {
   this.label = 'cdgfont';
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[1,-1],[-1,-1],[-1,1],[1,1]]);
      });
      this.afterSketch(function() {
         mFillCurve(makeOval(-1.0, 0.1,.9,.9));
         mFillCurve(makeOval( 0.1, 0.1,.9,.9));
         mFillCurve(makeOval( 0.1,-1.0,.9,.9));
         color('black');
         mFillCurve(makeOval(-0.85, 0.25,.6,.6));
         mFillRect([-.55,0.4],[0.0,0.7]);
         mFillRect([0,0],[0.3,1]);
      });
   }
}
