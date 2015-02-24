function() {
   this.label = 'camera';
   this.onIntersect = function(obj) { xDiff = obj.cx() - this.cx(); }
   var xDiff = -1;
   this.render = function() {
      mClosedCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mCurve(arc(0,0,.5,PI/2,-3*PI/2));
      this.setOutPortValue(xDiff < 0 ? 0 : 1);
   }
}
