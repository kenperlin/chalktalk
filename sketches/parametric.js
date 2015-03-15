function() {
   this.label = 'parametric';
   this.nu = 20;
   this.nv = 10;
   this.is3D = true;
   this.uv2xyz = function(u,v, dst) {
     var x = sin(TAU * u);
     var y = 2 * v - 1;
     var z = cos(TAU * u);
     dst.set(x, y, z);
   }
   this.render = function(elapsed) {
      this.duringSketch(function() {
         mLine([-1, 1],[-1,-1]);
         mLine([-1, 1],[ 1, 1]);
         mLine([-1,-1],[ 1,-1]);
         mLine([ 1, 1],[ 1,-1]);
      });
      this.afterSketch(function() {
         var du = 1 / this.nu;
         var dv = 1 / this.nv;
	 for (var u = 0 ; u < .999 ; u += du)
	 for (var v = 0 ; v < .999 ; v += dv) {
            this.uv2xyz(u   , v   , loop[0]);
            this.uv2xyz(u+du, v   , loop[1]);
            this.uv2xyz(u+du, v+dv, loop[2]);
            this.uv2xyz(u   , v+dv, loop[3]);
	    mClosedCurve(loop);
	 }
      });
   }
   var loop = [newVec3(),newVec3(),newVec3(),newVec3()];
}
