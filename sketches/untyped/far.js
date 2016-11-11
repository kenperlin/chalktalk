function() {
   this.label = 'far';
   this.is3D = true;
   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,-1],[-1,1]);
         mLine([-1,1],[1,1]);
      });
      this.afterSketch(function() {
         for (var z = -200 ; z <= 0 ; z += 20) {
	    color(abs(z) < 190 ? 'rgb(255,255,0)' : 'rgb(0,255,255)');
            mClosedCurve([[-3,-3,z],[-3,3,z],[3,3,z],[3,-3,z]]);
         }
      });
   }
}
