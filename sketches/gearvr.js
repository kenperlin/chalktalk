function() {
   this.label = 'gearvr';
   this.is3D = true;
   this.render = function() {
      m.translate(0,0,.4);
      mClosedCurve([[-1,.6],[1,.6],[1,-.6],[-1,-.6]]);
      mCurve(arc(-.4,0,.3,PI/2,-3*PI/2));
      mCurve(arc( .4,0,.3,PI/2,-3*PI/2));
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
