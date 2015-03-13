
function Noise() {
   var abs = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.abs(x[i]);
      return dst;
   };
   var add = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + y[i];
      return dst;
   };
   var dot = function(x, y) {
      var z = 0;
      for (var i = 0 ; i < x.length ; i++)
         z += x[i] * y[i];
      return z;
   };
   var fade = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i]*x[i]*x[i]*(x[i]*(x[i]*6.0-15.0)+10.0);
      return dst;
   };
   var floor = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.floor(x[i]);
      return dst;
   };
   var fract = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i]);
      return dst;
   };
   var gt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] > 0 ? 1 : 0;
      return dst;
   };
   var lt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] < 0 ? 1 : 0;
      return dst;
   };
   var mix = function(x, y, t, dst) {
      if (! Array.isArray(x))
         return x + (y - x) * t;
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + (y[i] - x[i]) * t;
      return dst;
   };
   var mod289 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i] * (1.0 / 289.0)) * 289.0;
      return dst;
   };
   var multiply = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * y[i];
      return dst;
   };
   var multiplyScalar = function(x, s) {
      for (var i = 0 ; i < x.length ; i++)
         x[i] *= s;
      return x;
   };
   var permute = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         tmp0[i] = (x[i] * 34.0 + 1.0) * x[i];
      mod289(tmp0, dst);
      return dst;
   };
   var scale = function(x, s, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * s;
      return dst;
   };
   var set3 = function(a, b, c, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      return dst;
   }
   var set4 = function(a, b, c, d, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      dst[3] = d;
      return dst;
   }
   var subtract = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - y[i];
      return dst;
   };
   var taylorInvSqrt = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = 1.79284291400159 - 0.85373472095314 * x[i];
      return dst;
   };

   var HALF4 = [.5,.5,.5,.5];
   var ONE3  = [1,1,1];
   var f     = [0,0,0];
   var f0    = [0,0,0];
   var f1    = [0,0,0];
   var g0    = [0,0,0];
   var g1    = [0,0,0];
   var g2    = [0,0,0];
   var g3    = [0,0,0];
   var g4    = [0,0,0];
   var g5    = [0,0,0];
   var g6    = [0,0,0];
   var g7    = [0,0,0];
   var gx0   = [0,0,0,0];
   var gy0   = [0,0,0,0];
   var gx1   = [0,0,0,0];
   var gy1   = [0,0,0,0];
   var gz0   = [0,0,0,0];
   var gz1   = [0,0,0,0];
   var i0    = [0,0,0];
   var i1    = [0,0,0];
   var ix    = [0,0,0,0];
   var ixy   = [0,0,0,0];
   var ixy0  = [0,0,0,0];
   var ixy1  = [0,0,0,0];
   var iy    = [0,0,0,0];
   var iz0   = [0,0,0,0];
   var iz1   = [0,0,0,0];
   var norm0 = [0,0,0,0];
   var norm1 = [0,0,0,0];
   var nz    = [0,0,0,0];
   var nz0   = [0,0,0,0];
   var nz1   = [0,0,0,0];
   var tmp0  = [0,0,0,0];
   var tmp1  = [0,0,0,0];
   var tmp2  = [0,0,0,0];
   var sz0   = [0,0,0,0];
   var sz1   = [0,0,0,0];
   var t3    = [0,0,0];

   this.noise = function(P) {
      mod289(floor(P, t3), i0);
      mod289(add(i0, ONE3, t3), i1);
      fract(P, f0);
      subtract(f0, ONE3, f1);
      fade(f0, f);

      set4(i0[0], i1[0], i0[0], i1[0], ix );
      set4(i0[1], i0[1], i1[1], i1[1], iy );
      set4(i0[2], i0[2], i0[2], i0[2], iz0);
      set4(i1[2], i1[2], i1[2], i1[2], iz1);

      permute(add(permute(ix, tmp1), iy, tmp2), ixy);
      permute(add(ixy, iz0, tmp1), ixy0);
      permute(add(ixy, iz1, tmp1), ixy1);

      scale(ixy0, 1 / 7, gx0);
      scale(ixy1, 1 / 7, gx1);
      subtract(fract(scale(floor(gx0, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy0);
      subtract(fract(scale(floor(gx1, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy1);
      fract(gx0, gx0);
      fract(gx1, gx1);
      subtract(subtract(HALF4, abs(gx0, tmp1), tmp2), abs(gy0, tmp0), gz0);
      subtract(subtract(HALF4, abs(gx1, tmp1), tmp2), abs(gy1, tmp0), gz1);
      gt0(gz0, sz0);
      gt0(gz1, sz1);

      subtract(gx0, multiply(sz0, subtract(lt0(gx0, tmp1), HALF4, tmp2), tmp0), gx0);
      subtract(gy0, multiply(sz0, subtract(lt0(gy0, tmp1), HALF4, tmp2), tmp0), gy0);
      subtract(gx1, multiply(sz1, subtract(lt0(gx1, tmp1), HALF4, tmp2), tmp0), gx1);
      subtract(gy1, multiply(sz1, subtract(lt0(gy1, tmp1), HALF4, tmp2), tmp0), gy1);

      set3(gx0[0],gy0[0],gz0[0], g0);
      set3(gx0[1],gy0[1],gz0[1], g1);
      set3(gx0[2],gy0[2],gz0[2], g2);
      set3(gx0[3],gy0[3],gz0[3], g3);
      set3(gx1[0],gy1[0],gz1[0], g4);
      set3(gx1[1],gy1[1],gz1[1], g5);
      set3(gx1[2],gy1[2],gz1[2], g6);
      set3(gx1[3],gy1[3],gz1[3], g7);

      taylorInvSqrt(set4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3), tmp0), norm0);
      taylorInvSqrt(set4(dot(g4,g4), dot(g5,g5), dot(g6,g6), dot(g7,g7), tmp0), norm1);

      multiplyScalar(g0, norm0[0]);
      multiplyScalar(g1, norm0[1]);
      multiplyScalar(g2, norm0[2]);
      multiplyScalar(g3, norm0[3]);

      multiplyScalar(g4, norm1[0]);
      multiplyScalar(g5, norm1[1]);
      multiplyScalar(g6, norm1[2]);
      multiplyScalar(g7, norm1[3]);

      mix(set4(g0[0] * f0[0] + g0[1] * f0[1] + g0[2] * f0[2],
               g1[0] * f1[0] + g1[1] * f0[1] + g1[2] * f0[2],
               g2[0] * f0[0] + g2[1] * f1[1] + g2[2] * f0[2],
               g3[0] * f1[0] + g3[1] * f1[1] + g3[2] * f0[2], tmp1),

          set4(g4[0] * f0[0] + g4[1] * f0[1] + g4[2] * f1[2],
               g5[0] * f1[0] + g5[1] * f0[1] + g5[2] * f1[2],
               g6[0] * f0[0] + g6[1] * f1[1] + g6[2] * f1[2],
               g7[0] * f1[0] + g7[1] * f1[1] + g7[2] * f1[2], tmp2), f[2], nz);

      return 2.2 * mix(mix(nz[0],nz[2],f[1]), mix(nz[1],nz[3],f[1]), f[0]);
   };
};
 
