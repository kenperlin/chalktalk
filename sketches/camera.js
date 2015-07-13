function() {
   this.label = 'camera';
   var state;
   this.onIntersect = function(obj) {
      state = obj.cx() > this.cx();
   }
   this.render = function() {
      mClosedCurve([[-1,.7], [1,.7], [1,-.7], [-1,-.7]]);
      mCurve(arc(0, 0, .5, PI/2, -3*PI/2));
      this.setOutPortValue(state);
   }
}
