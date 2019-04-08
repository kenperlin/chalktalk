function() {
   this.label = 'opencone';
   this.onSwipe[2] = ['more', () => nSides += 4 ];
   this.onSwipe[6] = ['less', () => nSides = max(4, nSides - 4) ];
   this.render = function() {
      this.duringSketch(function() {
         mLine([1,-1],[0,1]);
         mLine([0,1],[-1,-1]);
      });
      m.rotateX(-PI/2);
      mOpenCone(nSides);
   }
   var nSides = 12;
}
