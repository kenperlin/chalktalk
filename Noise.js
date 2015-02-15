
function Noise() {
   function abs(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(Math.abs(x[i]));
      return y;
   }
   function add(x, y) {
      var z = [];
      for (var i = 0 ; i < x.length ; i++)
         z.push(x[i] + y[i]);
      return z;
   }
   function dot(x, y) {
      var z = 0;
      for (var i = 0 ; i < x.length ; i++)
         z += x[i] * y[i];
      return z;
   }
   function fade(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(x[i]*x[i]*x[i]*(x[i]*(x[i]*6.0-15.0)+10.0));
      return y;
   }
   function floor(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(Math.floor(x[i]));
      return y;
   }
   function fract(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(x[i] - Math.floor(x[i]));
      return y;
   }
   function mix(x, y, t) {
      if (! Array.isArray(x))
         return x + (y - x) * t;
      var z = [];
      for (var i = 0 ; i < x.length ; i++)
         z.push(x[i] + (y[i] - x[i]) * t);
      return z;
   }
   function mod289(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(x[i] - Math.floor(x[i] * (1.0 / 289.0)) * 289.0);
      return y;
   }
   function multiply(x, y) {
      var z = [];
      for (var i = 0 ; i < x.length ; i++)
         z.push(x[i] * y[i]);
      return z;
   }
   function multiplyScalar(x, s) {
      for (var i = 0 ; i < x.length ; i++)
         x *= s;
   }
   function permute(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push((x[i] * 34. + 1.) * x[i]);
      return mod289(y);
   }
   function scale(x, s) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(x[i] * s);
      return y;
   }
   function step(x, y) {
      var z = [];
      for (var i = 0 ; i < x.length ; i++)
         z.push(x[i] < y[i] ? 0 : 1);
      return z;
   }
   function subtract(x, y) {
      var z = [];
      for (var i = 0 ; i < x.length ; i++)
         z.push(x[i] - y[i]);
      return z;
   }
   function taylorInvSqrt(x) {
      var y = [];
      for (var i = 0 ; i < x.length ; i++)
         y.push(1.79284291400159 - 0.85373472095314 * x[i]);
      return y;
   }
   this.noise = function(P) {
      var i0 = mod289(floor(P)), i1 = mod289(add(i0, [1,1,1]));
      var f0 = fract(P), f1 = subtract(f0, [1,1,1]), f = fade(f0);
      var ix = [i0[0], i1[0], i0[0], i1[0]], iy = [i0[1], i0[1], i1[1], i1[1]];
      var iz0 = [i0[2], i0[2], i0[2], i0[2]], iz1 = [i1[2], i1[2], i1[2], i1[2]];
      var ixy = permute(add(permute(ix), iy)), ixy0 = permute(add(ixy, iz0)), ixy1 = permute(add(ixy, iz1));
      var gx0 = scale(ixy0, 1 / 7), gy0 = subtract(fract(scale(floor(gx0), 1 / 7)), [.5,.5,.5,.5]);
      var gx1 = scale(ixy1, 1 / 7), gy1 = subtract(fract(scale(floor(gx1), 1 / 7)), [.5,.5,.5,.5]);
      gx0 = fract(gx0); gx1 = fract(gx1);
      var gz0 = subtract(subtract([.5,.5,.5,.5], abs(gx0)), abs(gy0)), sz0 = step(gz0, [0,0,0,0]);
      var gz1 = subtract(subtract([.5,.5,.5,.5], abs(gx1)), abs(gy1)), sz1 = step(gz1, [0,0,0,0]);
      gx0 = subtract(gx0, multiply(sz0, subtract(step([0,0,0,0], gx0), [.5,.5,.5,.5])));
      gy0 = subtract(gy0, multiply(sz0, subtract(step([0,0,0,0], gy0), [.5,.5,.5,.5])));
      gx1 = subtract(gx1, multiply(sz1, subtract(step([0,0,0,0], gx1), [.5,.5,.5,.5])));
      gy1 = subtract(gy1, multiply(sz1, subtract(step([0,0,0,0], gy1), [.5,.5,.5,.5])));
      var g0 = [gx0[0],gy0[0],gz0[0]], g1 = [gx0[1],gy0[1],gz0[1]],
          g2 = [gx0[2],gy0[2],gz0[2]], g3 = [gx0[3],gy0[3],gz0[3]],
          g4 = [gx1[0],gy1[0],gz1[0]], g5 = [gx1[1],gy1[1],gz1[1]],
          g6 = [gx1[2],gy1[2],gz1[2]], g7 = [gx1[3],gy1[3],gz1[3]];
      var norm0 = taylorInvSqrt([dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)]);
      var norm1 = taylorInvSqrt([dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)]);
      multiplyScalar(g0, norm0[0]); multiplyScalar(g2, norm0[1]); multiplyScalar(g1, norm0[2]); multiplyScalar(g3, norm0[3]);
      multiplyScalar(g4, norm1[0]); multiplyScalar(g6, norm1[1]); multiplyScalar(g5, norm1[3]); multiplyScalar(g7, norm1[3]);
      var nz = mix([dot(g0, [f0[0], f0[1], f0[2]]), dot(g1, [f1[0], f0[1], f0[2]]),
                    dot(g2, [f0[0], f1[1], f0[2]]), dot(g3, [f1[0], f1[1], f0[2]])],
                   [dot(g4, [f0[0], f0[1], f1[2]]), dot(g5, [f1[0], f0[1], f1[2]]),
                    dot(g6, [f0[0], f1[1], f1[2]]), dot(g7, [f1[0], f1[1], f1[2]])], f[2]);
      return 2.2 * mix(mix(nz[0],nz[2],f[1]), mix(nz[1],nz[3],f[1]), f[0]);
   }
}
   
