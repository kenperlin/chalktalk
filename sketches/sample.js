function() {
   this.label = 'sample';
   this.render = function() {
      mCurve(makeSpline([[-.5,1],[.25,.8],[1,.5]]));
      mCurve(makeSpline([[1,.5],[.8,-.25],[.5,-1]]));
      mCurve(makeSpline([[.5,-1],[-.25,-.7],[-1,-.5]]));
      mCurve(makeSpline([[-1,-.5],[-.7,.25],[-.5,1]]));
      this.afterSketch(function() {
         color(defaultPenColor);
         var eps = 0.2;
         lineWidth(0.5);
         for (var x = -1 ; x <= 1 ; x += eps)
            mLine([x,-1-eps],[x,1+eps]);
         for (var y = -1 ; y <= 1 ; y += eps)
            mLine([-1-eps,y],[1+eps,y]);
      });
   }
}
