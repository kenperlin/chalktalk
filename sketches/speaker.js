
function() {
   this.label = 'speaker';
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      var a = .16;
      var b = .5;
      m.translate(-.1,0,0);
      mCurve([[b,b],[b,-b],[-a,-a],[-b,-a],[-b,a],[-a,a],[b,b]]);
      this.afterSketch(function() {
      });
   }
}
