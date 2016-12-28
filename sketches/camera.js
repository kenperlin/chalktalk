function() {
   this.label = 'camera';
   this.state = 0;
   this.onIntersect = function(obj) {
      this.state = obj.cx() > this.cx();
   }
   this.render = function() {
      mClosedCurve([[-1,.7], [1,.7], [1,-.7], [-1,-.7]]);
      mCurve(arc(0, 0, .5, PI/2, -3*PI/2));
   }
   this.output = function() { return this.state; }
}
