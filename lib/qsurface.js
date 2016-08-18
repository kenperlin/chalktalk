// Raytracable quadratic surface, represented as 10 quadratic coefficients: xx yy zz yz zx xy x y z 1

function QSurface() {
   this.init = function(c) { this.C = cloneArray(c); }

   this.transform = function(mSrc) {
      var m = CT.matrixInverse(mSrc);

      var a = m[ 0], b = m[ 1], c = m[ 2];
      var d = m[ 4], e = m[ 5], f = m[ 6];
      var g = m[ 8], h = m[ 9], i = m[10];
      var j = m[12], k = m[13], l = m[14];

      var s = this.C, A = s[0], B = s[1], C = s[2], D = s[3], E = s[4],
                      F = s[5], G = s[6], H = s[7], I = s[8], J = s[9];

      this.C[0] =    A*a*a + B*b*b + C*c*c  + D*b*c       + E*c*a       + F*a*b;
      this.C[1] =    A*d*d + B*e*e + C*f*f  + D*e*f       + E*f*d       + F*d*e;
      this.C[2] =    A*g*g + B*h*h + C*i*i  + D*h*i       + E*i*g       + F*g*h;
      this.C[3] = 2*(A*d*g + B*e*h + C*f*i) + D*(e*i+h*f) + E*(f*g+i*d) + F*(d*h+g*e);
      this.C[4] = 2*(A*g*a + B*h*b + C*i*c) + D*(h*c+b*i) + E*(i*a+c*g) + F*(g*b+a*h);
      this.C[5] = 2*(A*a*d + B*b*e + C*c*f) + D*(b*f+e*c) + E*(c*d+f*a) + F*(a*e+d*b);
      this.C[6] = 2*(A*a*j + B*b*k + C*c*l) + G*a + H*b + I*c;
      this.C[7] = 2*(A*d*j + B*e*k + C*f*l) + G*d + H*e + I*f;
      this.C[8] = 2*(A*g*j + B*h*k + C*i*l) + G*g + H*h + I*i;
      this.C[9] =    A*j*j + B*k*k + C*l*l  + D*k*l + E*l*j + F*j*k + G*j + H*k + I*l + J;
   }

   this.traceRay = function(v, w, t) {
      var vx = v[0], vy = v[1], vz = v[2], wx = w[0], wy = w[1], wz = w[2];

      var s = this.C, A = s[0], B = s[1], C = s[2], D = s[3], E = s[4],
                      F = s[5], G = s[6], H = s[7], I = s[8], J = s[9];
      return solveQuadratic(t,
         A*wx*wx + B*wy*wy + C*wz*wz + D*wy*wz + E*wz*wx + F*wx*wy,
         2*A*vx*wx + 2*B*vy*wy + 2*C*vz*wz + D*(vy*wz + vz*wy)
                                           + E*(vz*wx + vx*wz)
                                           + F*(vx*wy + vy*wx) + G*wx + H*wy + I*wz,
         A*vx*vx + B*vy*vy + C*vz*vz + D*vy*vz + E*vz*vx + F*vx*vy + G*vx + H*vy + I*vz + J);
   }

   this.computePointOnRay = function(v, w, t) {
      return [ v[0] + t * w[0], v[1] + t * w[1], v[2] + t * w[2] ];
   }

   this.computeReflection = function(v, w, S, sign) {
      sign = def(sign, 1);
      var N = [0,0,0], L, d;
      normalize(this.computeGradient(S, N));
      L = normalize([S[0] - v[0], S[1] - v[1], S[2] - v[2]]);
      d = dot(L, w);
      return [L[0] + sign * 2 * d * N[0], L[1] + sign * 2 * d * N[1], L[2] + sign * 2 * d * N[2]];
   }

   this.computeGradient = function(p, g) {
      var s = this.C;
      g[0] = 2 * s[0] * p[0] + s[4] * p[2] + s[5] * p[1] + s[6];
      g[1] = 2 * s[1] * p[1] + s[5] * p[0] + s[3] * p[2] + s[7];
      g[2] = 2 * s[2] * p[2] + s[3] * p[1] + s[4] * p[0] + s[8];
      return g;
   }
}

function QCone    () { this.init([1,1,-1, 0,0,0, 0,0,0,  0]); }; QCone    .prototype = new QSurface;
function QCylinder() { this.init([1,1, 0, 0,0,0, 0,0,0, -1]); }; QCylinder.prototype = new QSurface;
function QSlab    () { this.init([0,0, 1, 0,0,0, 0,0,0, -1]); }; QSlab    .prototype = new QSurface;
function QSphere  () { this.init([1,1, 1, 0,0,0, 0,0,0, -1]); }; QSphere  .prototype = new QSurface;

