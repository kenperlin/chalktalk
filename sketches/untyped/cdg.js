function() {
   this.label = 'cdg';
   this.render = function() {
      this.afterSketch(function() {
         color('white');
         mFillCurve([[-1.3,-1.3],[1.3,-1.3],[1.3,1.3],[-1.3,1.3]]);
         color('black');
         mFillCurve([[-1.2,-1.2],[1.2,-1.2],[1.2,1.2],[-1.2,1.2]]);
         color('white');
      });
      lineWidth(1);
      this.duringSketch(function() {
         mLine([-1,1],[-1,-1]);
      });
      mLine([-1,1],[1,1]);
      this.afterSketch(function() {
         mLine([-1, .5],[1, .5]);
         mLine([-1,  0],[1,  0]);
         mLine([-1,-.5],[1,-.5]);
      });
      mLine([-1,-1],[1,-1]);
      lineWidth(4);
      this.afterSketch(function() {
         var v = .1;
         var s = .08;
         var dx = .05;
         mCurve([ [-.5,.4-s], [-.75,.4+s],[-.75,.1+s],[-.5,.1-s] ]);
         mCurve([ [.25-dx,.65-s], [0-dx,.65+s],[0-dx,.35+s],[.25-dx,.35-s], [.25-dx,1] ]);
         mCurve([ [.75,-.65-s], [.5,-.65+s],[.5,-.35+s],[.75,-.35-s], [.75,-1-s], [.5,-1+s] ]);
      });
   }
}
