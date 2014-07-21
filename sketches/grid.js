
function Grid() {
   this.labels = "grid".split(' ');
   this.gridMode = -1;
   this.is3D = true;

   this.onSwipe = function(dx, dy) {
      this.gridMode = pieMenuIndex(dx, dy);
   }
   this.render = function(elapsed) {
      var f = 2/3;
      m.save();
         m.scale(this.size / 400);
         if (this.gridMode != 3) {
            mCurve([[-1,0], [1, 0]]);
            mCurve([[ 0,1], [0, -1]]);
            mCurve([[-1, f], [1, f]]);
            mCurve([[-1,-f], [1,-f]]);
            mCurve([[-f,1], [-f,-1]]);
            mCurve([[ f,1], [ f,-1]]);
         }
         this.afterSketch(function() {

	    function n2(x, y) { return noise2(x, y + 10); }

            var uColor = 'rgb(255,64,64)';
            var vColor = 'rgb(64,255,64)';
            switch (this.gridMode) {
            case 3:
            case 2:
               var d = 1/20;
               var e = d/2;
               lineWidth(0.5);
               for (var u = -1 ; u <= 1 + d/2 ; u += d)
               for (var v = -1 ; v <= 1 + d/2 ; v += d) {
                  var t0 = n2(u  , v  )*f;
                  var tu = n2(u+d, v  )*f;
                  var tv = n2(u  , v+d)*f;
                  if (u < 1) {
                     color(uColor);
                     mCurve([[u*f,v*f,t0] , [(u+d)*f,v*f,tu]]);
                  }
                  if (v < 1) {
                     color(vColor);
                     mCurve([[u*f,v*f,t0] , [u*f,(v+d)*f,tv]]);
                  }
               }
               if (this.gridMode == 3)
                  break;
            case 1:
               lineWidth(4);
               color(vColor);
               for (var u = -1 ; u <= 1 ; u += 1)
               for (var v = -1 ; v <= 1 ; v += 1) {
                  var t0 = n2(u, v    );
                  var t1 = n2(u, v+.01);
                  var s = .1 * (t1 - t0) / .01;
                  mCurve([[u*f,v*f-.1,-s] , [u*f,v*f+.1,s]]);
               }
            case 0:
               lineWidth(4);
               color(uColor);
               for (var u = -1 ; u <= 1 ; u += 1)
               for (var v = -1 ; v <= 1 ; v += 1) {
                  var t0 = n2(u    , v);
                  var t1 = n2(u+.01, v);
                  var s = .1 * (t1 - t0) / .01;
                  mCurve([[u*f-.1,v*f,-s] , [u*f+.1,v*f,s]]);
               }
               break;
            }
         });
      m.restore();
   }
}
Grid.prototype = new Sketch;
