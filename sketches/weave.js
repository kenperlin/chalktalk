function() {
   this.label = "weave";
   this.is3D = true;
   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve([[0,1],[1, 2/3],[-1, 1/3],[0, 0]]);
         mCurve([[0,0],[1,-1/3],[-1,-2/3],[0,-1]]);
      });
      this.afterSketch(function() {
         var N = 800;
         var L = 14;
         var C = [];
         for (var i = 0 ; i <= N ; i++) {
            var theta = TAU * i / (N / L);
            var y = 2 * i / N - 1 + sin(6.5 * theta) / L;
            var r = sqrt(1 - y * y / 2);
            C.push([
               r * sin(theta),
               y,
               r * cos(theta)
            ]);
         }
         mCurve(C);
      });
   }
}
