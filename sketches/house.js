function() {
   this.label = 'house';
   this.render = function(elapsed) {
      mClosedCurve([ [-1,.8], [-1,-1], [1,-1], [1,.8], [0,1.7] ]);
   }
}
