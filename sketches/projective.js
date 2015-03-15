function() {
   this.label = 'projective';
   this.is3D = true;
   var keys = [[0,1,0],[-.5,.7,0],[-.7,0,0],[-.5,-.3,0],[0,-.5,0],[.5,0,0]];
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   this.render = function() {
      mLine([-1,0],[1,0]);
      mLine([0,-1],[0,1]);
      m.translate(0,0,.5);
      mCurve(makeSpline(keys));
      this.afterSketch(function() {
         _g.save();
         lineWidth(.5);
	 color(scrimColor(.2));
         mFillCurve(makeOval(-1.1,-1.1,2.2,2.2));
         _g.restore();
      });
      switch (this.mode) {
      case 3:
         color('red');
         mArrow([0,0,-.5], [.75,0,-.5]);
      case 2:
         color(defaultPenColor);
	 lineWidth(.5);
         for (var i = 0 ; i < keys.length ; i++) {
	    mDot(keys[i]);
	    mArrow([0,0,-.5], mix([0,0,-.5], keys[i], 1.5));
         }
      case 1:
	 mDot(keys[keys.length-1]);
      }
   }
}
