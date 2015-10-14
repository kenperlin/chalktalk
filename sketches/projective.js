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
         textHeight(this.mScale(0.07));
         _g.save();
         lineWidth(.5);
         color(scrimColor(.2, this.colorId));
         mFillCurve(makeOval(-1.1,-1.1,2.2,2.2));
         _g.restore();
      });
      switch (this.mode) {
      case 4:
      case 3:
         color('red');
         mArrow([0,0,-.5], [.5,0,-.5]);
	 mText("1\n0\n0", [.6,0,-.5], .5, .5);
      case 2:
         color(defaultPenColor);
	 mText(this.mode==4 ? "2\n0\n2" : "1\n0\n1", [.6,0,0], .5, .5);
         color('cyan');
         lineWidth(.5);
         for (var i = 0 ; i < keys.length ; i++) {
            mDot(keys[i]);
            mArrow([0,0,-.5], mix([0,0,-.5], keys[i], 1.5));
         }
	 mText("( x / w , y / w )", [.6,.6,0], .5, .5);
      case 1:
         mDot(keys[keys.length-1]);
      }
   }
}
