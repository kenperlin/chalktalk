function() {
   this.label = 'cube4d';
   this.is3D = true;
   this.onClick = function() { trackball.identity(); }
   this.onPress = function(B) { A.copy(B); }
   this.onDrag = function(B) { trackball.rotate([A.x,A.y,A.z,1], [B.x,B.y,B.z,1]); A.copy(B); }

   var trackball = new Trackball(4), A = newVec3(), C = [], P = [], tmp = [0,0,0,0], n, i,
       E = [ 0,2,4,6,8,10,12,14, 0,1,4,5,8,9,12,13, 0,1,2,3,8,9,10,11, 0,1,2,3,4,5,6,7 ];

   for (n = 0 ; n < 16 ; n++) {
      C.push([n & 1 ? 1 : -1, n>>1 & 1 ? 1 : -1, n>>2 & 1 ? 1 : -1, n>>3 & 1 ? 1 : -1]);
      P.push([0,0,0]);
   }

   this.render = function() {
      this.duringSketch(function() {
         mClosedCurve([[ -1, -1],[ -1, 1],[ 1, 1],[ 1, -1]]);
         mClosedCurve([[-.8,-.8],[-.8,.8],[.8,.8],[.8,-.8]]);
      });
      this.afterSketch(function() {
         for (n = 0 ; n < 16 ; n++) {
	    trackball.transform(C[n], tmp);
	    for (i = 0 ; i < 3 ; i++)
	       P[n][i] = tmp[i];
         }
         for (n = 0 ; n < E.length ; n++)
	    mLine(P[E[n]], P[E[n] + (1 << (n >> 3))]);
      });
   }
}

