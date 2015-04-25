function() {
   this.label = 'mipmap2';
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   this.render = function() {
      mClosedCurve([[-1,-1],[.5,-1],[1,-.5],[-.5,-.5]]);
      if (this.mode > 0) {
         m.translate(0,1,0);
         mClosedCurve([[-1,-1],[.5,-1],[1,-.5],[-.5,-.5]]);
	 lineWidth(1);
	 mLine([mix(-1,.5,.5),-1],[mix(-.5,1,.5),-.5]);
	 mLine([mix(-1,-.5,.5),-.75],[mix(.5,1,.5),-.75]);
	 if (this.mode > 1) {
	    m.translate(.2,-.1-.75,0);
	    mDot([0,0],.1);
	    mDot([0,-1],.1);
	    mLine([0,0],[0,-1]);
	    if (this.mode > 2)
	       mDot([0,-.6],.2);
        }
      }
   }
}
