function() {
   this.label = 'Dot';
   this.render = function() {
      this.duringSketch(function(){
         mDrawOval([-1,-1], [1,1], 32, PI, 0);
         mDrawOval([-1,-1], [1,1], 32, 0, -PI);
      });
      this.afterSketch(function(){
         mFillOval([-1,-1], [1,1], 32, PI, PI - TAU);
      });
   }
}
