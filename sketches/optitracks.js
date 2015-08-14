function() {
   this.label = 'optitracks';
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,0],[1,0]);
         for (var i = 0 ; i < 4 ; i++) {
            var x = .5 * (i - 1.5);
            mLine([x,.2],[x,-.2]);
         }
      });
      this.afterSketch(function() {
         for (var i = 0 ; i < 4 ; i++) {
            var x = .5 * (i - 1.5);
            mDrawRect([x-.1,-.1],[x+.1,.2]);
            mDrawRect([x-.05,-.2],[x+.05,-.1]);
         }
      });
   }
}
