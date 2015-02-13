function Ray2() {
   this.label = 'ray2';
   this.is3D = true;
   this.p = [1,0,0];
   this.onDown = function(point) { this.p[0] = point.x; }
   this.onDrag = function(point) { this.p[0] = point.x; }
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,0],[1,0]);
         mCurve([[.8,.2],[1,0],[.8,-.2]]);
      });
      this.afterSketch(function() {
         textHeight(this.mScale(0.1));
	 mArrow([-1,0],[-.5,0]);
	 lineWidth(1);
	 mLine([-.5,0],this.p);
         mText("V", [-1,0], 0, 2);
         mText("W", [-.5,0], 0, 2);
         mText("t", this.p, 0, 2);
         mDot(this.p, .1);
      });
   }
}
Ray2.prototype = new Sketch;
addSketchType('Ray2');
