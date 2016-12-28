function() {
   this.label = 'noisegrid';
   this.gridMode = -1;
   this.is3D = true;

   this.onSwipe[0] = ['mode = 0', function() { this.gridMode = 0; }];
   this.onSwipe[2] = ['mode = 1', function() { this.gridMode = 1; }];
   this.onSwipe[4] = ['mode = 2', function() { this.gridMode = 2; }];
   this.onSwipe[6] = ['mode = 3', function() { this.gridMode = 3; }];

   this.render = function(elapsed) {
      var f = 2/3;
      m.save();
         m.scale(this.size / 400);
	 this.duringSketch(function() {
            mLine([-1, f], [1, f]);
            mLine([-f,1], [-f,-1]);
            mLine([-1,-f], [1,-f]);
            mLine([ f,1], [ f,-1]);
	 });
         this.afterSketch(function() {
            if (this.gridMode != 3) {
               mLine([-1,0], [1, 0]);
               mLine([ 0,1], [0, -1]);
               mLine([-1, f], [1, f]);
               mLine([-1,-f], [1,-f]);
               mLine([-f,1], [-f,-1]);
               mLine([ f,1], [ f,-1]);
            }

            function n2(x, y) { return noise2(x, y + 10); }

            var uColor = 'rgb(255,64,64)';
            var vColor = 'rgb(64,64,255)';
            switch (this.gridMode) {
            case 3:
            case 2:
               var d = 1/10;
               var e = d/2;
               lineWidth(1);
               for (var u = -1 ; u <= 1 ; u += d)
               for (var v = -1 ; v <= 1 ; v += d) {
                  var t0 = n2(u  , v  )*f;
                  var tu = n2(u+d, v  )*f;
                  var tv = n2(u  , v+d)*f;
                  if (u < 1 - d) {
                     color(uColor);
                     mLine([u*f,v*f,t0] , [(u+d)*f,v*f,tu]);
                  }
                  if (v < 1 - d) {
                     color(vColor);
                     mLine([u*f,v*f,t0] , [u*f,(v+d)*f,tv]);
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

