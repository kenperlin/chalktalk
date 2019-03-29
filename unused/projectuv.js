function() {
   this.label = 'projuv';
   this.is3D = true;
   this.mode = 0;
   this.onCmdClick = function() { this.mode = (this.mode + 1) % 3; }
   this.render = function() {
      this.duringSketch(function() {
         mClosedCurve([[-.2,1.1],[.2,.9],[.2,-.9],[-.2,-1.1]]);
         mLine([0,0],[1,0]);
      });
      this.afterSketch(function() {
         var eps = 0.1;
         var mode = this.mode;
         var f = function(u, v, w) {
            switch (mode) {
            case 0: return [w,(2*v-1)*(.9+.2*u),2*u-1];
            case 1: var theta = TAU * u;
                    return [w*sin(theta), 2*v-1, w*cos(theta)];
            case 2: var theta = TAU * u;
                    var phi = PI * v - PI / 2;
                    return [w*sin(theta)*cos(phi), w*sin(phi), w*cos(theta)*cos(phi)];
            }
         }
         m.rotateY(-0.2);

         for (var u = 0 ; u <= 1    ; u += eps)
         for (var v = 0 ; v <  .999 ; v += eps) {
            color(uvColor(u, v));
            mLine(f(u,v,0), f(u,v+eps,0));
         }
         for (var u = 0 ; u <  .999 ; u += eps)
         for (var v = 0 ; v <= 1    ; v += eps) {
            color(uvColor(u, v));
            mLine(f(u,v,0), f(u+eps,v,0));
         }

         color('red');
         for (var u = 0 ; u <= 1 ; u += eps)
         for (var v = 0 ; v <= 1 ; v += eps) {
            color(uvColor(u, v));
            mArrow(f(u,v,0), f(u,v,1));
         }
      });
   }
}

