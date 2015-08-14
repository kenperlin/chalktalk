function() {
   this.label = 'marker';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.5,-.5,1,1,20,PI/2,PI/2-TAU));
         mLine([-1,0],[1,0]);
         mLine([0,1],[0,-1]);
      });
      this.afterSketch(function() {
         mFillCurve(makeOval(-.5,-.5,1,1,20,PI/2,PI/2-TAU));
         for (var i = 0 ; i < 8 ; i++) {
            var theta = TAU * i / 8;
            mArrow([0,0],[cos(theta),sin(theta)]);
         }
      });
   }
}
