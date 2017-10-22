var marchingTetrahedra = {
eval : function(V, ni, nj, z) {
   function n2i(n) { return  n             % ni; }
   function n2j(n) { return (n / dj >>> 0) % nj; }
   function n2k(n) { return  n / dk >>> 0      ; }
   function E(a, b) {
      if (a > b) { let tmp = a; a = b; b = tmp; }
      let ai = n2i(a), aj = n2j(a), ak = n2k(a),
          bi = n2i(b), bj = n2j(b), bk = n2k(b);
      let m = (n << 6) + (ai & bi ?  1 << 6 : ai      | bi << 3)
                       + (aj & bj ? dj << 6 : aj << 1 | bj << 4)
                       + (ak & bk ? dk << 6 : ak << 2 | bk << 5);
      if (tag[m] === undefined) {
         tag[m] = P.length / 3;
	 let t = (z - V[n+a]) / (V[n+b] - V[n+a]);
         P.push(2 * (i + ai + t * (bi - ai)) / ni - 1,
                2 * (j + aj + t * (bj - aj)) / ni - 1,
                2 * (k + ak + t * (bk - ak)) / ni - 1);
      }
      return tag[m];
   }
   function tri(a, b, c, d) {
      T.push(E(a,b), E(a,c), E(a,d));
   }
   function quad(a, b, c, d) {
      let bc = E(b,c), ad = E(a,d);
      T.push(bc, E(a,c), ad, ad, E(b,d), bc);
   }
   var nk = V.length / (ni * nj), dj = ni, dk = ni * nj;
   var P = [], T = [], tag = [], i, j, k, m = 0, n;
   var dij = 1+dj, dik = 1+dk, djk = dj + dk, d = 1 + dj + dk;
   var pb = [1  , dj  , dk, 1  , dj , dk ];
   var pc = [dij, djk, dik, dik, dij, djk];
   var lo = newArray(nj * nk), hi = newArray(nj * nk);

   for (k = 0 ; k < nk ; k++)
   for (j = 0 ; j < nj ; j++) {
      let n0 = m * ni, n1 = n0 + ni - 1;
      for (n = n0 ; n <= n1 && V[n] > z ; n++) ;
      lo[m] = max(0, n-1 - n0);
      for (n = n1 ; n >= n0 && V[n] > z ; --n) ;
      hi[m] = min(ni-1, n+1 - n0);
      m++;
   }
   for (k = 0 ; k < nk - 1 ; k++) {
      let i0, i1, m = k * nj, n1, s0, s1;
      for (j = 0 ; j < nj - 1 ; j++, m++) {
         i0 = min(lo[m], lo[m+1], lo[m+ni], lo[m+1+ni]);
         i1 = max(hi[m], hi[m+1], hi[m+ni], hi[m+1+ni]);
         if (i0 <= i1) {
            n  = m * ni + i0;
            n1 = m * ni + i1;
            s0 = (V[n]>z) + (V[n+dj]>z) + (V[n+dk]>z) + (V[n+djk]>z);
            for (i = i0 ; n <= n1 ; i++, n++, s0 = s1) {
               s1 = (V[n+1]>z) + (V[n+dij]>z) + (V[n+dik]>z) + (V[n+d]>z);
	       if (s0 + s1 & 7) {
                  let ad = (V[n] > z) | (V[n+d] > z) << 3;
	          for (let p = 0 ; p < 6 ; p++) {
	             let b = pb[p];
	             let c = pc[p];
	             switch (ad | (V[n+b] > z) << 1 | (V[n+c] > z) << 2) {
	             case  1: tri (0, b, c, d); break;
	             case  2: tri (b, c, 0, d); break;
	             case  3: quad(0, b, c, d); break;
	             case  4: tri (c, d, 0, b); break;
	             case  5: quad(0, c, d, b); break;
	             case  6: quad(b, c, 0, d); break;
	             case  7: tri (d, b, c, 0); break;
	             case  8: tri (d, 0, c, b); break;
	             case  9: quad(0, d, b, c); break;
	             case 10: quad(b, d, c, 0); break;
	             case 11: tri (c, b, 0, d); break;
	             case 12: quad(c, d, 0, b); break;
	             case 13: tri (b, d, 0, c); break;
	             case 14: tri (0, d, c, b); break;
	             }
	          }
	       }
	    }
         }
      }
   }
   for (let m = 0 ; m < T.length ; m += 3) {
      let a = 3 * T[m], b = 3 * T[m+1], c = 3 * T[m+2],
          n = floor(ni*(P[a]+1)/2) + floor(ni*(P[a+1]+1)/2) * dj + floor(ni*(P[a+2]+1)/2) * dk,
          u = CT.cross([P[b] - P[a], P[b+1] - P[a+1], P[b+2] - P[a+2]], 
                       [P[c] - P[b], P[c+1] - P[b+1], P[c+2] - P[b+2]]),
          v = [ V[n+1] - V[n], V[n+dj] - V[n], V[n+dk] - V[n] ];
      if (CT.dot(u, v) < 0) { let tmp = T[m]; T[m] = T[m + 2]; T[m + 2] = tmp; }
   }
   return [P, T];
},
}; try { module.exports = marchingTetrahedra; } catch(e) {}
