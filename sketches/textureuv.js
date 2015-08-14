function() {
   this.label = 'textureuv';
   this.is3D = true;
   this.code = [['','texture = f(u,v)']];
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   this.render = function() {
      this.duringSketch(function() {
         mClosedCurve(makeOval(-1,.8,2,.4,32,PI,PI+TAU));
         mLine([-1,1],[-1,-1]);
         mLine([ 1,1],[ 1,-1]);
         mCurve(makeOval(-1,-1.3,2,.6,32,PI,PI+PI));
      });
      this.afterSketch(function() {
         var uEps = 0.1;
         var vEps = 0.1;
         var mode = this.mode % 3;
         switch (mode) {
         case 0: uEps = 1/30; vEps = 1/10; break;
         case 1: uEps = 1/30; vEps = 1/15; break;
         case 2: uEps = 1/30; vEps = 1/10; break;
         }
         var f = function(u,v) {
            var theta = TAU * u;
            switch (mode) {
            case 0: return [ sin(theta), 2 * v - 1, cos(theta) ];
            case 1: var phi = PI * v - PI / 2;
                    return [ sin(theta) * cos(phi), sin(phi), cos(theta) * cos(phi) ];
            case 2: var r = 0.2;
                    var phi = TAU * v;
                    var R = 1 + r * cos(phi);
                    return [ R * sin(theta), r * sin(phi), R * cos(theta) ];
            }
         }
         m.rotateX(0.2);
         for (var u = 0 ; u <= 1    ; u += uEps)
         for (var v = 0 ; v <  .999 ; v += vEps) {
            color(uvColor(u, v));
            mLine(f(u,v), f(u,v+vEps));
         }
         for (var u = 0 ; u <  .999 ; u += uEps)
         for (var v = 0 ; v <= 1    ; v += vEps) {
            color(uvColor(u, v));
            mLine(f(u,v), f(u+uEps,v));
         }
      });
   };
}
