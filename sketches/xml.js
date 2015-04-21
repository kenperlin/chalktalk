function() {
   this.wiggle = [];
   for (var i = 0 ; i <= 10 ; i++)
      this.wiggle.push([2*i/10,2*sin(2*TAU*i/10)/10]);
   this.label = 'xml';
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,1],[1,-1]);
         mLine([1,1],[-1,-1]);
         mCurve(this.wiggle);
      });
      this.afterSketch(function() {
         textHeight(this.mScale(.4));
         mText("<xml>" , [0, 1], .5, .5);
         mText("....." , [0, .1], .5, .5);
         mText("</xml>", [0, -1], .5, .5);
	 lineWidth(1);
	 mDrawRect([-1,-1.4],[1,1.4]);
	 color('pink');
	 lineWidth(2);
	 mArrow([ 1.1, .5], [ 2.5, 1], .2);
	 mArrow([-1.1, .5], [-2.5, 1], .2);
	 mArrow([ 1.1,-.5], [ 2.5,-1], .2);
	 mArrow([-1.1,-.5], [-2.5,-1], .2);
         mText("WiFi", [2, 0], .5, .5);
      });
   }
}
