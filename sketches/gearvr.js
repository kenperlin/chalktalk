function() {
   this.label = 'gearvr';
   this.is3D = true;
   this.render = function() {
      m.translate(0,0,.4);
      mClosedCurve([[-1,.6],[1,.6],[1,-.6],[-1,-.6]]);
      mDrawOval([-.7,-.3],[-.1,.3],32, PI/2, -3*PI/2);
      mDrawOval([ .1,-.3],[ .7,.3],32, PI/2, -3*PI/2);
      this.afterSketch(function() {
         var z = -.8;
         mLine([-1, .6, 0],[-1, .6, z]);
         mLine([ 1, .6, 0],[ 1, .6, z]);
         mLine([ 1,-.6, 0],[ 1,-.6, z]);
         mLine([-1, .6, z],[ 1, .6, z]);
         mLine([ 1, .6, z],[ 1,-.6, z]);
      });
   }
}
