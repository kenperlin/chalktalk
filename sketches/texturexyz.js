function() {
   this.label = 'texturexyz';
   this.code = [['','texture = f(x,y,z)']];
   this.render = function() {
      mClosedCurve(makeSpline([[0,1],[1,0],[.3,-.8],[-.3,-1],[-1,-.2],[-.5,.2],[-.5,.9],[0,1]]));
   };
}
