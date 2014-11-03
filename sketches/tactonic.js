function Tactonic() {
   this.labels = "tactonic".split(' ');

   this.S = [];
   var s = 1 / 36;
   for (var c = 0 ; c < 48 ; c++) {
      var x = (c - 24) * s;
      for (var r = 0 ; r < 72 ; r++) {
         var y = (r - 36) * s;
         this.S.push([[x,y],[x+s*1.1,y],[x+s*1.1,y+s*1.1],[x,y+s*1.1]]);
      }
   }

   this.C = [];
   for (var i = 0 ; i < 255 ; i++)
      this.C.push('rgb(' + i + ',' + i + ',' + i + ')');

   this.render = function() {
      this.duringSketch(function() {
         mLine([-1,1],[1,1]);
         mLine([0,1],[0,-1]);
      });
      this.afterSketch(function() {
         var n = 0;
         for (var c = 0 ; c < 48 ; c++) {
            var x = (c - 24) * s;
            for (var r = 0 ; r < 72 ; r++) {
               var y = (r - 36) * s;
               var f = .5 + .5 * sin(5 * x - time) * sin(5 * y);
               color(this.C[floor(255 * max(0, min(1, f)))]);
               mFillCurve(this.S[n]);
	       n++;
            }
         }
      });
   }
}
Tactonic.prototype = new Sketch;
addSketchType("Tactonic");
