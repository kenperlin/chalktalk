function() {
   this.label = "coord";
   this.is3D = true;
   var planes = [[1,0,0,1],[-1,0,0,1],[0,1,0,1],[0,-1,0,1],[0,0,1,1],[0,0,-1,1]];
   this.isNegZ = false;
   this.onCmdClick = function() { this.isNegZ = ! this.isNegZ; }
   function clipEdgeToUnitCube(edge) {
      for (var n = 0 ; n < planes.length ; n++)
         if ((edge = clipLineToPlane(edge, planes[n])).length < 2)
            break;
      return edge;
   }
   this.radius = 0.3;
   this.edges = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
   this.render = function(elapsed) {
      var r = this.radius;

      mLine([-1,0], [1,0]);
      mLine([0,-1], [0,1]);

      this.duringSketch(function() {
         mClosedCurve([ [-r,-r], [r,-r], [r,r], [-r,r] ]);
      });

      this.afterSketch(function() {
         mLine([0,0,-1], [0,0,1]);

         // LABEL THE THREE AXES.

         textHeight(12);
         mText("x", [1.2,0,0], .5,.5);
         mText("y", [0,1.2,0], .5,.5);
         mText("z", [0,0,1.2], .5,.5);

         // START WITH A CUBE.

         var C = [];
         for (var k = -r ; k <= r ; k += 2 * r)
         for (var j = -r ; j <= r ; j += 2 * r)
         for (var i = -r ; i <= r ; i += 2 * r)
            C.push([i,j,k,1]);

         if (this.isNegZ)
            for (var i = 0 ; i < C.length ; i++) {
               C[i][0] *= .2;
               C[i][1] *= .2;
               C[i][2] *= .2;
               C[i][2] -= .2;
            }

         // IF THERE IS AN INPUT MATRIX, THEN TRANSFORM CUBE.
         
         if (this.inValues.length == 16) {
            var M = this.inValues;
            for (var n = 0 ; n < C.length ; n++) {
               C[n] = [ max(-1,min(1, dot4(C[n], [M[0], M[4], M[ 8], M[12]]))),
                        max(-1,min(1, dot4(C[n], [M[1], M[5], M[ 9], M[13]]))),
                        max(-1,min(1, dot4(C[n], [M[2], M[6], M[10], M[14]]))),
                        max(-1,min(1, dot4(C[n], [M[3], M[7], M[11], M[15]]))) ];
               for (var i = 0 ; i < 4 ; i++)
                  C[n][i] /= C[n][3];
            }
         }

         // CLIP EDGES OF CUBE TO BOUNDING VOLUME.

         lineWidth(1);
         for (var n = 0 ; n < this.edges.length ; n++) {
            var L = clipEdgeToUnitCube( [ C[this.edges[n][0]], C[this.edges[n][1]] ] );
            if (L.length == 2)
               mLine(L[0], L[1]);
         }

         // FADE UP BOUNDING VOLUME.

         if (this.afterSketchTransition > 0) {
            lineWidth(0.25 * sCurve(this.afterSketchTransition));
            for (var n = 0 ; n < 8 ; n++)
               C[n] = [n & 1 ? 1 : -1, n>>1 & 1 ? 1 : -1, n>>2 & 1 ? 1 : -1];
            for (var n = 0 ; n < this.edges.length ; n++)
               mLine(C[this.edges[n][0]], C[this.edges[n][1]]);
         }
      });
   }
}
