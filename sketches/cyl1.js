function() {
   this.label = "cyl1";
   this.is3D = true;
   this.nSteps = 8;
   this.mouseDrag = function(x, y) {
      if (this.y0 === undefined)
         this.y0 = y;
      var i0 = floor(this.y0 / 20);
      var i1 = floor(     y  / 20);
      if (i1 != i0) {
         this.nSteps = max(4, this.nSteps + (i1 < i0 ? 1 : -1));
         this.y0 = y;
      }
   }
   this.mouseUp = function(x, y) {
      delete this.y0;
   }
   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve([[1,-1],[-1,-1],[-1,1],[1,1],[1,-1]]);
      });
      this.afterSketch(function() {
         var C0 = [], C1 = [], C2 = [], C3 = [], C4 = [];
         for (var theta = 0 ; theta <= TAU + .0001 ; theta += TAU / this.nSteps) {
            var c = cos(theta);
            var s = sin(theta);
            C0.push([s, 1,c]);
            C1.push([s,-1,c]);
            C2.push([0, 1,0]);
            C2.push([s, 1,c]);
            C3.push([0,-1,0]);
            C3.push([s,-1,c]);
            C4.push([s, 1,c]);
            if (theta < TAU)
               C4.push([s,-1,c]);
         }
         mCurve(C0);
         mCurve(C1);
         lineWidth(.5);
         mCurve(C2);
         mCurve(C3);
         mCurve(C4);
      });
   }
}
