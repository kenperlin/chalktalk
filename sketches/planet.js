function() {
   this.label = 'planet';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 16,  PI/2,3*PI/2));
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 16,3*PI/2,5*PI/2));
      });
   }

   this.fragmentShaders = [

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   float dz = sqrt(1.-x*x-y*y);                      /* DEPTH  */'
   ,'   float s = .3*x + .3*y + .9*dz; s *= s; s *= s;    /* LIGHT  */'
   ,'   float cR = cos(.2*uTime), sR = sin(.2*uTime);     /* MOTION */'
   ,'   float cV = cos(.1*uTime), sV = sin(.1*uTime);'
   ,'   vec3 P = vec3(cR*x+sR*dz+cV,y,-sR*x+cR*dz+sV);'
   ,'   float g = turbulence(P);                          /* CLOUDS */'
   ,'   float d = 1. - 1.2 * (x*x + y*y);                 /* EDGE   */'
   ,'   d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : max(0.,d+.1);'
   ,'   float f = -.2 + sin(4. * P.x + 8. * g + 4.);      /* FIRE   */'
   ,'   f = f > 0. ? 1. : 1. - f * f * f;'
   ,'   f *= d > .1 ? 1. : (g + 5.) / 3.;'
   ,'   vec3 color = vec3(d*f*f*.85, d*f, d*.7);          /* COLOR  */'
   ,'   gl_FragColor = vec4(color,alpha*min(1.,10.*d));'
   ,'}'
   ].join('\n'),

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   float a = .7;'
   ,'   float b = .72;'
   ,'   float s = 0.;'
   ,'   float r0 = sqrt(x*x + y*y);'
   ,'   if (r0 > a && r0 <= 1.) {'
   ,'      float r = r0;'
   ,'      float ti = uTime*.3;'
   ,'      float t = mod(ti, 1.);'
   ,'      float u0 = turbulence(vec3(x*(2.-t)/2., y*(2.-t)/2., .2* t    +2.));'
   ,'      float u1 = turbulence(vec3(x*(2.-t)   , y*(2.-t)   , .2*(t-1.)+2.));'
   ,'      r = min(1., r - .1 + 0.3 * mix(u0, u1, t));'
   ,'      s = (1. - r) / (1. - b);'
   ,'   }'
   ,'   if (r0 < b)'
   ,'      s *= (r0 - a) / (b - a);'
   ,'   vec3 color = vec3(s);'
   ,'   float ss = s * s;'
   ,'   color = s*vec3(1.,ss,ss*ss);'
   ,'   gl_FragColor = vec4(color,alpha*s);'
   ,'}'
   ].join('\n'),

   [
   ,'float turb(vec3 P) {'
   ,'   float f = 0., s = 1.;'
   ,'   for (int i = 0 ; i < 7 ; i++) {'
   ,'      f += abs(noise(s * P)) / s;'
   ,'      s *= 2.;'
   ,'      P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);'
   ,'   }'
   ,'   return f;'
   ,'}'
   ,'void main(void) {'
   ,'   gl_FragColor = vec4(1., 1., 1., 1.) * turb(vPosition);'
   ,'}'
   ].join('\n'),

   phongShader.concat(M_turbulence.concat(
   [
   ,'// TEST MODULAR TURBULENCE.'
   ,'void main(void) {'
   ,'   vec3 P = vPosition;'
   ,'   float cx = cos(.15 * uTime), sx = sin(.15 * uTime);    // ROTATE ABOUT X'
   ,'   float cy = cos(.1  * uTime), sy = sin(.1  * uTime);    // ROTATE ABOUT Y'
   ,'   P = vec3(P.x                , P.y * cx + P.z * sx, P.y * sx - P.z * cx);'
   ,'   P = vec3(P.x * cy + P.z * sy, P.y                , P.x * sy - P.z * cy);'
   ,'   vec3 color = phongShader(normalize(vNormal));'
   ,'   gl_FragColor = vec4(color, 1.) * M_turbulence(vec3(.5, .5, .5) + .5 * P);'
   ,'}'
   ,''
   ].join('\n'))),

   N_fractal.concat(
   [
   ,'void main(void) {'
   ,'   vec4 f = N_fractal(.5 + .5 * vPosition);'
   ,'   vec4 a = abs(f);'
   ,'   float s = a.x + a.y + a.z + a.w;'
   ,'   gl_FragColor = vec4(pow(vec3(s,s,s), vec3(.45,.45,.45)), 1.);'
   ,'}'
   ].join('\n')),

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   vec3 P = vec3(x,y,0.);'
   ,'   float r = noise(2.*P)<0.?0.:1.;'
   ,'   float g = noise(4.*P)<0.?0.:1.;'
   ,'   float b = noise(8.*P)<0.?0.:1.;'
   ,'   float a = x*x+y*y<1.?1.:0.;'
   ,'   gl_FragColor = vec4(a*r*.7,a*g*.5,a*b,a);'
   ,'}'
   ].join('\n'),

   [
   ,'void main(void) {'
   ,'   float x = vPosition.x;'
   ,'   float y = vPosition.y;'
   ,'   vec3 P = 2. * vec3(x, y, floor(uTime));'
   ,'   float s = noise(P) + noise(2.*P) < 0. ? 0. : 1.;'
   ,'   gl_FragColor = (x*x + y*y < 1. ? 1. : 0.) * vec4(s,s,s,1.);'
   ,'}'
   ].join('\n'),

   [
   ,'float wall(float x) {'
   ,'   return clamp(x, 0., 1.);'
   ,'}'
   ,'float sphere(vec4 S, vec3 p) {'
   ,'   p = (p - S.xyz) / S.w;'
   ,'   return wall(1. - dot(p, p));'
   ,'}'
   ,'float cube(vec4 S, vec3 p) {'
   ,'   p = (p - S.xyz) / S.w;'
   ,'   return wall(1. - p.x * p.x) *'
   ,'          wall(1. - p.y * p.y) *'
   ,'          wall(1. - p.z * p.z);'
   ,'}'
   ,'float vol(vec3 p) {'
   ,'   return sphere(vec4(0.,0.,0.,1.), p) * pow(.2 * noise(2. * p) + .8, 20.);'
   ,'}'
   ,'float rnd(float x, float y) {'
   ,'   return fract(cos(x * 23.14 + y * 2.66) * 12345.6789);'
   ,'}'
   ,'void main(void) {'
   ,'   float tilt = -.3;'
   ,'   float spin = .4 * uTime;'
   ,''
   ,'   float cx = cos(tilt);'
   ,'   float sx = sin(tilt);'
   ,'   float cy = cos(spin);'
   ,'   float sy = sin(spin);'
   ,''
   ,'   float x1 = vPosition.x;'
   ,'   float y1 = vPosition.y;'
   ,'   float a = 0.;'
   ,'   float c = 0.;'
   ,'   float eps = .01;'
   ,'   float numSteps = 50.;'
   ,'   float power = pow(100. / numSteps, .1);'
   ,''
   ,'   for (int i = 0 ; i < 20 ; i++) {'
   ,'      float z1 = 1. - 2. * (float(i)) / numSteps;'
   ,''
   ,'      float x2 =  x1;'
   ,'      float y2 =  y1 * cx + z1 * sx;'
   ,'      float z2 = -y1 * sx + z1 * cx;'
   ,''
   ,'      float x =  x2 * cy + z2 * sy;'
   ,'      float y =  y2;'
   ,'      float z = -x2 * sy + z2 * cy;'
   ,''
   ,'      float v  =  vol(vec3(x, y, z));'
   ,'      float vx = (vol(vec3(x + eps, y, z)) - v) / eps;'
   ,'      float vy = (vol(vec3(x, y + eps, z)) - v) / eps;'
   ,'      float vz = (vol(vec3(x, y, z + eps)) - v) / eps;'
   ,''
   ,'      a += v / numSteps;'
   ,'      if (a >= .9)'
   ,'         break;'
   ,''
   ,'      float ak = 1. - pow(1. - v, power);'
   ,'      float t = ak * (1. - a);'
   ,'      c += t * (2. + vx + vy + vz);'
   ,'      a += t;'
   ,'   }'
   ,'   gl_FragColor = sqrt(a * vec4(c,c,c,1.));'
   ,'}'
   ].join('\n'),
   ];

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}
/*

float wall(float x) {
   return clamp(x, 0., 1.);
}
float sphere(vec4 S, vec3 p) {
   p = (p - S.xyz) / S.w;
   return wall(1. - dot(p, p));
}
float cube(vec4 S, vec3 p) {
   p = (p - S.xyz) / S.w;
   return wall(1. - p.x * p.x) *
          wall(1. - p.y * p.y) *
          wall(1. - p.z * p.z);
}
float vol(vec3 p) {
   float t = pow(.2 * noise(8. * p) + .8, 20.);
   return t * sphere(vec4(0.,0.,0.,1.), p);
}
float rnd(float x, float y) {
   return fract(cos(x * 23.14 + y * 2.66) * 12345.6789);
}
void main(void) {
   float tilt = -.3;
   float spin = .4 * uTime;

   float cx = cos(tilt);
   float sx = sin(tilt);
   float cy = cos(spin);
   float sy = sin(spin);

   float x1 = vPosition.x;
   float y1 = vPosition.y;
   float a = 0.;
   float c = 0.;
   float eps = .01;
   float numSteps = 50.;
   float power = pow(100. / numSteps, .3);

   for (int i = 0 ; i < 20 ; i++) {
      float z1 = 1. - 2. * (float(i)) / numSteps;

      float x2 =  x1;
      float y2 =  y1 * cx + z1 * sx;
      float z2 = -y1 * sx + z1 * cx;

      float x =  x2 * cy + z2 * sy;
      float y =  y2;
      float z = -x2 * sy + z2 * cy;

      float v  =  vol(vec3(x, y, z));
      float vx = (vol(vec3(x + eps, y, z)) - v) / eps;
      float vy = (vol(vec3(x, y + eps, z)) - v) / eps;
      float vz = (vol(vec3(x, y, z + eps)) - v) / eps;

      a += v / numSteps;
      if (a >= .9)
         break;

      float ak = 1. - pow(1. - v, power);
      float t = ak * (1. - a);
      c += t * (2. + vx + vy + vz);
      a += t;

      //s = (1. - a) * s + (vx + vy + vz) / eps;
   }
   gl_FragColor = sqrt(a * vec4(c,c,c,1.));
}
*/
