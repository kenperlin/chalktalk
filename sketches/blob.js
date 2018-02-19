function() {
   var mode = 0;
   function createVolume() {
      var V = [];
      for (let i = 0 ; i < n ; i++)
      for (let j = 0 ; j < n ; j++)
      for (let k = 0 ; k < n ; k++) {
         let x = (i - n/2) / (n/2),
             y = (j - n/2) / (n/2),
             z = (k - n/2) / (n/2);

         let s, t, u, v, f, g;
         switch (mode) {
	 case 0:
            t = x * x + y * y + z * z;
            s = .2 + t + noise(2*x,2*y,2*z + .5 * time) / 2;
	    break;

	 case 1:
	    t = .15 + .05 * sin(time);
	    s = 1;
	    for (let u = -t ; u <= t ; u += 2 * t) {
               f = (x+u) * (x+u) + y * y + z * z;
               f = max(0, 1 - (12+21*t) * f);
	       s -= f * f * f;
            }
	    break;

         case 2:
            t = .1;
	    s = 1;
	    for (let u = -8 * t ; u <= 8 * t ; u += t) {
               v = .1 * sin(8 * u) * sin(time);
               f = (x+u) * (x+u) + (y+v) * (y+v) + z * z;
               f = max(0, 1 - 12 * f);
	       s -= f * f * f;
            }
	    break;

         case 3:
	    s = x * x + y * y + z * z;
	    break;
         }

         V.push(s);
      }
      return V;
   }
   var n = 30, V, P, T, N;
   this.label = 'blob';
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-1,1],[1,1],[1,0],[-1,0]]);
         mCurve([[-1,0],[1,0],[1,-1],[-1,-1]]);
      });
      this.afterSketch(function() {
         if (V === undefined) {
            V = createVolume();
            var PT = marchingTetrahedra.eval(V, n, n, .5);
            P = PT[0], T = PT[1];
            N = computeNormals(P, T);
	    for (let i = 0 ; i < 3 ; i++) {
               P = resampleVertices(P, T, N);
               N = computeNormals(P, T);
            }
	 }
         m.scale(2);
	 mPolyhedron(P, T, N);
      });
   }
} 


