function() {
   this.label = 'cone';
   this.onSwipe[2] = ['more', () => nSides += 4 ];
   this.onSwipe[6] = ['less', () => nSides = max(4, nSides - 4) ];
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[1,-1],[0,1],[-1,-1]]);
         mLine([-1,-1],[1,-1]);
      });
      m.rotateX(-PI/2);
      mCone(nSides);
   }
   var nSides = 12;
}
