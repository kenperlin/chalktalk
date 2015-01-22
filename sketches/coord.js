function Coord() {
   this.label = "coord";
   this.is3D = true;
   this.radius = 0.3;
   this.edges = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
   this.render = function() {
      var r = this.radius;

      mLine([-1,0], [1,0]);
      mLine([0,-1], [0,1]);

      this.duringSketch(function() {
         mClosedCurve([ [-r,-r], [r,-r], [r,r], [-r,r] ]);
      });

      this.afterSketch(function() {
         mLine([0,0,-1], [0,0,1]);

	 textHeight(12);
	 mText("x", [1.2,0,0], .5,.5);
	 mText("y", [0,1.2,0], .5,.5);
	 mText("z", [0,0,1.2], .5,.5);

         var C = [];
	 for (var k = -r ; k <= r ; k += 2 * r)
	 for (var j = -r ; j <= r ; j += 2 * r)
	 for (var i = -r ; i <= r ; i += 2 * r)
	    C.push([i,j,k]);
         
         if (isDef(this.inValue[0]) && this.inValue[0].length == 16) {
	    var M = this.inValue[0];
	    for (var n = 0 ; n < C.length ; n++) {
	       var x = C[n][0], y = C[n][1], z = C[n][2];
	       C[n] = [ max(-1,min(1, [ x * M[0] + y * M[4] + z * M[ 8] + M[12] ])),
	                max(-1,min(1, [ x * M[1] + y * M[5] + z * M[ 9] + M[13] ])),
	                max(-1,min(1, [ x * M[2] + y * M[6] + z * M[10] + M[14] ])) ];
	    }
	 }

         lineWidth(1);
	 for (var n = 0 ; n < this.edges.length ; n++)
	    mLine(C[this.edges[n][0]], C[this.edges[n][1]]);
      });
   }
}
Coord.prototype = new Sketch;
addSketchType("Coord");
