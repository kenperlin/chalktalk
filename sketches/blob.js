function() {
   var mode = 1;
   function createVolume() {
      var V = [];
      for (let k = 0 ; k < n ; k++)
      for (let j = 0 ; j < n ; j++)
      for (let i = 0 ; i < n ; i++) {
         let x = (i - n/2) / (n/2),
             y = (j - n/2) / (n/2),
             z = (k - n/2) / (n/2);

         let s, t, u, v, f, g;
         switch (mode) {
	 case 0:
            t = x * x + y * y + z * z;
            s = .2 + t + noise([2*x,2*y,2*z + .5 * time]) / 2;
	    break;

	 case 1:
	    t = .4;// + .05 * sin(time);
	    s = 1;
	    for (let u = -t ; u <= t ; u += 2 * t) {
               f = .1 * ((x+u) * (x+u) + y * y + z * z);
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
   var n = 60, V, P, T, N;
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
	 if (mode == 1) {
	    let theta = .5 * sin(6 * time);
	    let cs = cos(theta), sn = sin(theta);
	    let Q = [];
	    for (let n = 0 ; n < P.length ; n += 3) {
	       let x = P[n], y = P[n+1], z = P[n+2];
	       let t = sCurve(.5 * x + .5);
	       let x0 =  cs * x + sn * y;
	       let y0 = -sn * x + cs * y;
	       let x1 =  cs * x - sn * y;
	       let y1 =  sn * x + cs * y;
	       Q.push(mix(x0, x1, t), mix(y0, y1, t), z);
	    }
	    mPolyhedron(Q, T, computeNormals(Q, T));
         }
	 else
	    mPolyhedron(P, T, N);
      });
   }
} 


