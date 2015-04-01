function() {
   this.label = 'parametric';
   this.nu = 20;
   this.nv = 10;
   this.is3D = true;
   this.code = [["", 'return [cos(TAU*u),sin(TAU*u),2*v-1];' ]];
   this.uv2xyz = function(u,v, dst) {
/*
     var x = sin(TAU * u);
     var y = 2 * v - 1;
     var z = cos(TAU * u);
     dst.set(x, y, z);
*/
     var result = this._func(u,v);
     dst.set(result[0], result[1], result[2]);
   }
   this.render = function(elapsed) {
      try {
         this._func = new Function('u','v', this.code[0][1]);
      } catch(e) { console.log(e); }
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
